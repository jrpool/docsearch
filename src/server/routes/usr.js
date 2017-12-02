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

// Registration page.
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
    return '';
  }
  if (formData.password2 !== formData.password1) {
    response.render(
      'usr/register', {formError: msgs.errPasswordsDiffer, formData}
    );
    return '';
  }
  formData.pwHash = bcrypt.hashSync(formData.password1, bcrypt.genSaltSync(10));
  DbUsr.getUsr({type: 'nat', data: formData})
  .then(deepUsr => {
    if (deepUsr[0].id) {
      response.render(
        'usr/register', {formError: msgs.errAlreadyUsr, formData}
      );
      return '';
    }
    else {
      return DbUsr.createUsr(formData)
      // Substitute name and temporary UID into acknowledgements.
      .then(result => {
        msgs.regAckText = msgs.regAckText
          .replace('{1}', formData.name)
          .replace('{2}', formData.uid);
        msgs.regMailText = msgs.regMailText
          .replace('{1}', formData.name)
          .replace('{2}', formData.uid);
        response.render('usr/register-ack');
        return util.mailSend(
          [formData], msgs.regMailSubject, msgs.regMailText, msgs
        )
        .catch(error => console.log(error.toString()));
      })
      .catch(error => util.renderError(error, request, response, 'reg0'));
    }
  })
  .catch(error => util.renderError(error, request, response, 'reg1'));
});

// Deregistration button’s result.
router.get('/deregister', (request, response) => {
  const usr = response.locals.usr;
  return DbUsr.deleteUsr(usr[0].id)
  .then(() => {
    request.session.destroy();
    msgs.status = '';
    response.render('usr/deregister-ack');
    return util.mailSend(
      [usr],
      msgs.deregMailSubject,
      msgs.deregMailText.replace('{1}', usr.name.replace(/[,;]/g, '-')),
      msgs
    )
    .catch(error => console.log(error.toString()));;
  })
  .catch(error => util.renderError(error, request, response, 'dereg'));
});

// Login page.
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
  return DbUsr.getUsr({type: 'uid', data: formData})
  .then(deepUsr => {
    if (deepUsr[0].id) {
      if (!bcrypt.compareSync(formData.password, deepUsr[0].pwhash)) {
        response.render(
          'usr/login', {formError: msgs.errLogin, formData}
        );
      }
      else {
        delete deepUsr[0].pwhash;
        request.session.usrID = response.locals.usr[0].id;
        response.render('usr/login-ack');
      }
    }
    else {
      response.render(
        'usr/login', {formError: msgs.errLogin, formData}
      );
    }
    return '';
  })
  .catch(error => util.renderError(error, request, response, 'login'));
});

// Logout button’s result.
router.get('/logout', (request, response) => {
  delete request.session.usrID;
  delete request.session.id;
  request.session.destroy(error => {
    if (error) {
      util.renderError(error, request, response, 'logout');
    }
    else {
      response.locals.msgs.status = '';
      response.render('usr/logout-ack');
    }
  });
});

module.exports = router;
