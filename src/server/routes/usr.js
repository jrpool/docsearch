// Import required modules.
const DbUsr = require('../../db/usr');
const {renderError} = require('../util');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const getHash = password => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

router.get('/register', (request, response) => {
  const msgs = response.locals.msgs;
  response.render('usr/register', {formData: '', msgs});
});

router.post('/register', (request, response) => {
  const msgs = response.locals.msgs;
  const formData = request.body;
  if (
    !formData.name
    || !formData.email
    || !formData.password1
    || !formData.password2
  ) {
    response.render(
      'usr/register', {formError: msgs.errNeed4RegFacts, formData, msgs}
    );
    return;
  }
  if (formData.password2 !== formData.password1) {
    response.render(
      'usr/register', {formError: msgs.errPasswordsDiffer, formData, msgs}
    );
    return;
  }
  formData.pwHash = getHash(formData.password1);
  DbUsr.getUsr({type: 'nat', data: formData})
  .then(deepUsr => {
    if (deepUsr[0].id) {
      response.render(
        'usr/register', {formError: msgs.errAlreadyUsr, formData, msgs}
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
        response.render('usr/register-ack', {msgs});
        sgMail.send({
          to: {
            email: formData.email,
            name: formData.name.replace(/[,;]/g, '-')
          },
          cc: {
            email: process.env.CC_EMAIL,
            name: process.env.CC_NAME
          },
          from: {
            email: process.env.FROM_EMAIL,
            name: process.env.FROM_NAME
          },
          subject: msgs.regMailSubject,
          text: msgs.regMailText
        });
      });
    }
    return '';
  })
  .catch(error => renderError(error, request, response));
});

router.get('/deregister', (request, response) => {
  const msgs = response.locals.msgs;
  const usr = request.session.usr;
  sgMail.send({
    to: {
      email: usr.email,
      name: usr.name.replace(/[,;]/g, '-')
    },
    cc: {
      email: 'info@berkhouse.us',
      name: 'Jonathan Pool'
    },
    from: 'info@berkhouse.us',
    subject: msgs.deregMailSubject,
    text: msgs.deregMailText.replace('{1}', usr.name)
  });
  DbUsr.deleteUsr(request.session.usr.id)
  .then(() => {
    request.session.destroy();
    msgs.status = '';
    response.render('usr/deregister-ack', {msgs});
    return '';
  })
  .catch(error => renderError(error, request, response));
});

router.get('/login', (request, response) => {
  const msgs = response.locals.msgs;
  response.render('usr/login', {formData: '', msgs});
});

router.post('/login', (request, response) => {
  const msgs = response.locals.msgs;
  const formData = request.body;
  if (!formData.uid || !formData.password) {
    response.render(
      'usr/login', {formError: msgs.errNeed2LoginFacts, formData, msgs}
    );
    return '';
  }
  DbUsr.getUsr({type: 'uid', data: formData})
  .then(deepUsr => {
    if (deepUsr[0].id) {
      if (!bcrypt.compareSync(formData.password, deepUsr[0].pwhash)) {
        response.render(
          'usr/login', {formError: msgs.errLogin, formData, msgs}
        );
        return '';
      }
      else {
        delete deepUsr[0].pwhash;
        request.session.usr = deepUsr[0];
        request.session.cats = deepUsr[1];
        response.render('usr/login-ack', {msgs});
      }
    }
    else {
      response.render(
        'usr/login', {formError: msgs.errLogin, formData, msgs}
      );
      return '';
    }
  })
  .catch(error => renderError(error, request, response));
});

router.get('/logout', (request, response) => {
  const msgs = response.locals.msgs;
  delete request.session.usr;
  delete request.session.cats;
  delete request.session.id;
  msgs.status = '';
  response.render('usr/logout-ack', {msgs});
});

module.exports = router;
