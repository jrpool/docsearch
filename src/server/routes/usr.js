// Import and configure required modules.
const DbUsr = require('../../db/usr');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const routeUtil = require('./util');
const util = require('../util');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
      'usr/register',
      {formError: response.locals.msgs.errNeed4RegFacts, formData}
    );
    return '';
  }
  if (formData.password2 !== formData.password1) {
    response.render(
      'usr/register',
      {formError: response.locals.msgs.errPasswordsDiffer, formData}
    );
    return '';
  }
  formData.pwHash = bcrypt.hashSync(formData.password1, bcrypt.genSaltSync(10));
  delete formData.password1;
  delete formData.password2;
  DbUsr.getUsr({type: 'nat', data: formData})
  .then(deepUsr => {
    if (deepUsr[0].id) {
      response.render(
        'usr/register',
        {formError: response.locals.msgs.errAlreadyUsr, formData}
      );
      return '';
    }
    else {
      return DbUsr.createUsr(formData)
      // Substitute name and temporary UID into acknowledgements.
      .then(() => {
        delete formData.pwHash;
        response.locals.msgs.regAckText = response.locals.msgs.regAckText
          .replace('{1}', formData.name)
          .replace('{2}', formData.uid);
        response.locals.msgs.regMailText = response.locals.msgs.regMailText
          .replace('{1}', formData.name)
          .replace('{2}', formData.uid);
        response.render('usr/register-ack');
        return routeUtil.mailSend(
          [formData],
          response.locals.msgs.regMailSubject,
          response.locals.msgs.regMailText,
          response.locals.msgs
        )
        .catch(error => console.log(error.toString()));
      })
      .catch(error => routeUtil.renderError(error, request, response, 'reg0'));
    }
  })
  .catch(error => routeUtil.renderError(error, request, response, 'reg1'));
});

// Deregistration button logs user out and deregisters user.
router.get('/deregister', (request, response) => {
  const usr = response.locals.usr;
  return DbUsr.deleteUsr(usr[0].id)
  .then(() => {
    routeUtil.anonymizeUsr(request, response);
    response.render('usr/deregister-ack');
    return routeUtil.mailSend(
      [usr[0]],
      response.locals.msgs.deregMailSubject,
      response.locals.msgs.deregMailText.replace('{1}', usr[0].name),
      response.locals.msgs
    )
    .catch(error => console.log(error.toString()));;
  })
  .catch(error => routeUtil.renderError(error, request, response, 'dereg'));
});

// Login page.
router.get('/login', (request, response) => {
  response.render('usr/login', {formData: ''});
});
router.post('/login', (request, response) => {
  const formData = request.body;
  if (!formData.uid || !formData.password) {
    response.render(
      'usr/login',
      {formError: response.locals.msgs.errNeed2LoginFacts, formData}
    );
    return '';
  }
  return DbUsr.getUsr({type: 'uid', data: formData})
  .then(deepUsr => {
    if (deepUsr[0].id) {
      if (!bcrypt.compareSync(formData.password, deepUsr[0].pwhash)) {
        response.render(
          'usr/login', {formError: response.locals.msgs.errLogin, formData}
        );
      }
      else {
        delete deepUsr[0].pwhash;
        request.session.usrID = deepUsr[0].id;
        response.locals.msgs.status
          = util.personalStatusMsg(deepUsr[0], response.locals);
        response.render('usr/login-ack');
      }
    }
    else {
      response.render(
        'usr/login', {formError: response.locals.msgs.errLogin, formData}
      );
    }
    return '';
  })
  .catch(error => routeUtil.renderError(error, request, response, 'login'));
});

// Logout button’s result.
router.get('/logout', (request, response) => {
  routeUtil.anonymizeUsr(request, response);
  response.render('usr/logout-ack');
});

module.exports = router;
