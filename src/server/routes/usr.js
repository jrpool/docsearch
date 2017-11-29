// Import and configure required modules.
const DbUsr = require('../../db/usr');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const util = require('./util');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

let msgs;

router.use('/', (request, response, next) => {
  msgs = response.locals.msgs;
  next();
});

router.get('/register', (request, response) => {
  response.render('usr/register', {formData: ''});
});

router.post('/register', (request, response) => {
  const formData = request.body;
  if (
    !formData.name
    || !formData.email
    || !formData.password1
    || !formData.password2
  ) {
    response.render(
      'usr/register', {formError: msgs.errNeed4RegFacts, formData}
    );
    return;
  }
  if (formData.password2 !== formData.password1) {
    response.render(
      'usr/register', {formError: msgs.errPasswordsDiffer, formData}
    );
    return;
  }
  formData.pwHash = bcrypt.hashSync(formData.password1, bcrypt.genSaltSync(10));
  DbUsr.getUsr({type: 'nat', data: formData})
  .then(deepUsr => {
    if (deepUsr[0].id) {
      response.render(
        'usr/register', {formError: msgs.errAlreadyUsr, formData}
      );
    }
    else {
      DbUsr.createUsr(formData)
      // Substitute name and temporary UID into acknowledgements.
      .then(result => {
        msgs.regAckText = msgs.regAckText
          .replace('{1}', formData.name)
          .replace('{2}', formData.uid);
        msgs.regMailText = msgs.regMailText
          .replace('{1}', formData.name)
          .replace('{2}', formData.uid);
        response.render('usr/register-ack');
        util.mailSend(
          [formData], msgs.regMailSubject, msgs.regMailText, msgs
        );
      })
      .catch(error => util.renderError(error, request, response));
    }
    return '';
  })
  .catch(error => util.renderError(error, request, response));
});

router.get('/deregister', (request, response) => {
  const usr = request.session.usr;
  DbUsr.deleteUsr(request.session.usr.id)
  .then(() => {
    request.session.destroy();
    msgs.status = '';
    response.render('usr/deregister-ack');
    util.mailSend(
      [usr],
      msgs.deregMailSubject,
      msgs.deregMailText.replace('{1}', usr.name.replace(/[,;]/g, '-')),
      msgs
    );
    return '';
  })
  .catch(error => util.renderError(error, request, response));
});

router.get('/login', (request, response) => {
  response.render('usr/login', {formData: ''});
});

router.post('/login', (request, response) => {
  const formData = request.body;
  if (!formData.uid || !formData.password) {
    response.render(
      'usr/login', {formError: msgs.errNeed2LoginFacts, formData}
    );
    return '';
  }
  DbUsr.getUsr({type: 'uid', data: formData})
  .then(deepUsr => {
    if (deepUsr[0].id) {
      if (!bcrypt.compareSync(formData.password, deepUsr[0].pwhash)) {
        response.render(
          'usr/login', {formError: msgs.errLogin, formData}
        );
        return '';
      }
      else {
        delete deepUsr[0].pwhash;
        request.session.usr = deepUsr[0];
        request.session.cats = deepUsr[1];
        response.render('usr/login-ack');
      }
    }
    else {
      response.render(
        'usr/login', {formError: msgs.errLogin, formData}
      );
      return '';
    }
  })
  .catch(error => util.renderError(error, request, response));
});

router.get('/logout', (request, response) => {
  delete request.session.usr;
  delete request.session.cats;
  delete request.session.id;
  response.locals.msgs.status = '';
  response.render('usr/logout-ack');
});

module.exports = router;
