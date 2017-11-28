const DbUsr = require('../../db/usr');
const {renderError} = require('../util');
const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.use('/', (request, response, next) => {
  if (request.session.cats.includes(Number.parseInt(process.env.CURATOR_CAT))) {
    next();
  }
  else {
    response.redirect('/');
  }
});

router.get('/', (request, response) => {
  response.render('curate', {formData: ''});
});

router.get('/reg', (request, response) => {
  DbUsr.getUsrs()
  .then(usrs => {
    response.render('curate/reg', {formData: '', usrs});
  })
  .catch(error => renderError(error, request, response));
});

router.get('/reg/:id', (request, response) => {
  DbUsr.getUsr({type: 'id', id: Number.parseInt(request.params.id)})
  .then(deepUsr => {
    // Append to each msgs.cats element whether the user is in it.
    msgs.cats.forEach(
      cat => {cat.push(deepUsr[1].includes(cat[0]))}
    );
    response.render('curate/reg-edit', {usr: deepUsr[0]});
  })
  .catch(error => renderError(error, request, response));
});

router.post('/reg/:id', (request, response) => {
  const formData = request.body;
  if (formData.cats) {
    if (Array.isArray(formData.cats)) {
      formData.cats = formData.cats.map(idString => Number.parseInt(idString));
    }
    else {
      formData.cats = [Number.parseInt(formData.cats)];
    }
  }
  else {
    formData.cats = [];
  }
  msgs.cats.forEach(cat => {cat.push(formData.cats.includes(cat[0]))});
  if (
    !formData.uid
    || !formData.name
    || !formData.email
  ) {
    response.render(
      'curate/reg-edit', {formError: msgs.errNeed3RegFacts, usr: formData}
    );
    return;
  }
  formData.id = Number.parseInt(request.params.id);
  // Make the changes in the user’s database record.
  DbUsr.updateUsr(formData)
  .then(() => {
    DbUsr.getUsr({type: 'id', id: formData.id})
    .then(deepUsr => {
      delete deepUsr[0].pwhash;
      response.render('curate/reg-edit-ack', {deepUsr});
      sgMail.send({
        to: {
          email: deepUsr[0].email,
          name: deepUsr[0].name.replace(/[,;]/g, '-')
        },
        cc: {
          email: process.env.CC_EMAIL,
          name: process.env.CC_NAME
        },
        from: {
          email: process.env.FROM_EMAIL,
          name: process.env.FROM_NAME
        },
        subject: msgs.regEditMailSubject,
        text:
          msgs.regEditMailText.replace('{1}', deepUsr[0].name).replace(
            '{2}',
            '\n\n' + JSON.stringify(deepUsr[0]) + '\nCategories: ' + deepUsr[1]
          )
      });
    });
    // Then delete the user’s session data, forcibly logging the user out.
    request.sessionStore.list((error, fileNames) => {
      sids = fileNames.map(v => v.replace(/\.json$/, ''));
      sids.forEach(sid => {
        request.sessionStore.get(sid, (error, session) => {
          if (session.usr && (session.usr.id === formData.id)) {
            delete session.usr;
            request.sessionStore.set(sid, session, error => {
              if (error) {
                renderError(error, request, response);
              }
            });
          }
        })
      });
    });
    return '';
  })
  .catch(error => renderError(error, request, response));
});

router.get('/cat', (request, response) => {
  response.render('curate/cat', {formData: ''});
});

router.get('/dir', (request, response) => {
  response.render('curate/dir', {formData: ''});
});

module.exports = router;
