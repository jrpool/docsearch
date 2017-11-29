// Import required modules.
const DbUsr = require('../../db/usr');
const {renderError} = require('../util');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const util = require('./util');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const getHash = password => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

router.get('/register', (request, response) => {
  response.render('usr/register', {formData: ''});
});

const mailSend = (usrSource, subject, text) => {
  const options = {
    to: {
      email: usrSource.email,
      name: usrSource.name.replace(/[,;]/g, '-')
    },
    cc: {
      email: process.env.REG_EMAIL,
      name: process.env.REG_NAME
    },
    from: {
      email: process.env.FROM_EMAIL,
      name: process.env.FROM_NAME
    },
    subject: msgs.regMailSubject,
    text: msgs.regMailText
  };
  sgMail.send(options);
};

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
  formData.pwHash = getHash(formData.password1);
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
        mailSend(formData, msgs.regMailSubject, msgs.regMailText);
      });
    }
    return '';
  })
  .catch(error => renderError(error, request, response));
});

router.get('/deregister', (request, response) => {
  const usr = request.session.usr;
  DbUsr.deleteUsr(request.session.usr.id)
  .then(() => {
    request.session.destroy();
    msgs.status = '';
    response.render('usr/deregister-ack');
    util.mailSend(usr, msgs.deregMailSubject, msgs.deregMailText);
    return '';
  })
  .catch(error => renderError(error, request, response));
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
  .catch(error => renderError(error, request, response));
});

router.get('/logout', (request, response) => {
  delete request.session.usr;
  delete request.session.cats;
  delete request.session.id;
  response.locals.msgs.status = '';
  response.render('usr/logout-ack');
});

module.exports = router;
