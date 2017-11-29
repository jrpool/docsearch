const DbUsr = require('../../db/usr');
const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const util = require('./util');

let msgs;

// Redirect all curation queries to home page if user is not a curator.
router.use('/', (request, response, next) => {
  if (request.session.cats.includes(Number.parseInt(process.env.CURATOR_CAT))) {
    msgs = response.locals.msgs;
    next();
  }
  else {
    response.redirect('/');
  }
});

router.get('/', (request, response) => {
  response.render('curate', {formData: ''});
});

// Main page for curation of registrations.
router.get('/reg', (request, response) => {
  DbUsr.getUsrs()
  .then(usrs => {
    response.render('curate/reg', {formData: '', usrs});
  })
  .catch(error => util.renderError(error, request, response));
});

// Page for curation of a particular user’s registration.
router.get('/reg/:id', (request, response) => {
  DbUsr.getUsr({type: 'id', id: Number.parseInt(request.params.id)})
  .then(deepUsr => {
    // Append to each msgs.cats element whether the user is in it.
    msgs.cats.forEach(
      cat => {cat.push(deepUsr[1].includes(cat[0]))}
    );
    response.render('curate/reg-edit', {usr: deepUsr[0]});
  })
  .catch(error => util.renderError(error, request, response));
});

// Delete a user’s session data, forcibly logging the user out.
const deleteSession = (request, response, usrID) => {
  request.sessionStore.list((error, fileNames) => {
    const sids = fileNames.map(v => v.replace(/\.json$/, ''));
    sids.forEach(sid => {
      request.sessionStore.get(sid, (error, session) => {
        if (usr && (session.usr.id === usrID)) {
          delete session.usr;
          request.sessionStore.set(sid, session, error => {
            if (error) {
              util.renderError(error, request, response);
            }
          });
        }
      })
    });
  });
};

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
  /*
    Make the changes in the user’s database record and delete the user’s
    session records, forcibly logging the user out.
  */
  DbUsr.updateUsr(formData)
  .then(() => {
    DbUsr.getUsr({type: 'id', id: formData.id})
    .then(targetDeepUsr => {
      deleteSession(request, response, formData.id)
      .then(() => {
        delete targetDeepUsr[0].pwhash;
        response.render('curate/reg-edit-ack', {targetDeepUsr});
        util.mailSend(
          [targetDeepUsr[0], request.session.usr],
          msgs.regEditMailSubject,
          msgs.regEditMailText.replace('{1}', targetDeepUsr[0].name).replace(
            '{2}',
            '\n\n' + JSON.stringify(
              targetDeepUsr[0]
            ) + '\nCategories: ' + targetDeepUsr[1]
          ),
          msgs
        );
      });
    });
    return '';
  })
  .catch(error => util.renderError(error, request, response));
});

router.get('/reg/:id/deregister', (request, response) => {
  const usrID = request.params.id;
  DbUsr.getUsr({type: 'id', id: usrID})
  .then(targetDeepUsr => {
    DbUsr.deleteUsr(usrID)
    .then(() => {
      deleteSession(request, response, usrID);
      response.render('usr/deregister-ack');
      util.mailSend(
        [targetDeepUsr[0], request.session.usr],
        msgs.deregMailSubject,
        msgs.deregMailText,
        msgs
      );
      return '';
    })
  })
  .catch(error => util.renderError(error, request, response));
});

router.get('/cat', (request, response) => {
  response.render('curate/cat', {formData: ''});
});

router.get('/dir', (request, response) => {
  response.render('curate/dir', {formData: ''});
});

module.exports = router;
