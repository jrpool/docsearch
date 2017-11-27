const DbUsr = require('../../db/usr');
const {renderError} = require('../util');
const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get('/', (request, response) => {
  const msgs = response.locals.msgs;
  response.render('curate', {formData: '', msgs});
});

router.get('/reg', (request, response) => {
  const msgs = response.locals.msgs;
  DbUsr.getUsrs()
  .then(usrs => {
    response.render('curate/reg', {formData: '', usrs, msgs});
  })
  .catch(error => renderError(error, request, response));
});

router.get('/reg/:id', (request, response) => {
  const msgs = response.locals.msgs;
  DbUsr.getUsr({type: 'id', id: request.params.id})
  .then(deepUsr => {
    // Append to each msgs.cats element whether the user is in it.
    msgs.cats.forEach(
      cat => {cat.push(deepUsr[1].includes(cat[0]))}
    );
    response.render('curate/reg-edit', {usr: deepUsr[0], msgs});
  })
  .catch(error => renderError(error, request, response));
});

router.post('/reg/:id', (request, response) => {
  const msgs = response.locals.msgs;
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
      'curate/reg-edit', {formError: msgs.errNeed3RegFacts, usr: formData, msgs}
    );
    return;
  }
  formData.id = request.params.id;
  DbUsr.updateUsr(formData)
  .then(() => {
    DbUsr.getUsr({type: 'id', id: formData.id})
    .then(deepUsr => {
      delete deepUsr[0].pwhash;
      response.render('curate/reg-edit-ack', {deepUsr, msgs});
      sgMail.send({
        to: {
          email: deepUsr[0].email,
          name: deepUsr[0].name.replace(/[,;]/g, '-')
        },
        cc: {
          email: 'info@berkhouse.us',
          name: 'Jonathan Pool'
        },
        from: 'info@berkhouse.us',
        subject: msgs.regEditMailSubject,
        text:
          msgs.regEditMailText.replace('{1}', deepUsr[0].name).replace(
            '{2}',
            '\n\n' + JSON.stringify(deepUsr[0]) + '\nCategories: ' + deepUsr[1]
          )
      });
    });
    return '';
  })
  .catch(error => renderError(error, request, response));
});

router.get('/cat', (request, response) => {
  const msgs = response.locals.msgs;
  response.render('curate/cat', {formData: '', msgs});
});

router.get('/dir', (request, response) => {
  const msgs = response.locals.msgs;
  response.render('curate/dir', {formData: '', msgs});
});

module.exports = router;
