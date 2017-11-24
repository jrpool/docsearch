const DbUser = require('../../db/usr');
const {renderError, errorMsg, uiMsg} = require('../util');
const router = require('express').Router();
const bcrypt = require('bcrypt');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const getHash = password => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

router.get('/register', (request, response) => {
  response.render('usr/register', {formData: '', uiMsg});
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
  DbUser.getUsr('nat', formData)
  .then(usr => {
    if (usr.rowCount) {
      response.render(
        'usr/register', {formError: msgs.errAlreadyUsr, formData, msgs}
      );
    }
    else {
      DbUser.createUsr(formData)
      .then(result => {
        if (result === 'curator') {
          msgs.regAckText = msgs.regAckTextCur;
          msgs.regMailText = msgs.regMailTextCur;
        }
        response.render('usr/register-ack', {msgs});
        sgMail.send({
          to: {
            email: formData.email,
            name: formData.name.replace(/[,;]/g, '-')
          },
          cc: {
            email: 'info@berkhouse.us',
            name: 'Jonathan Pool'
          },
          from: 'info@berkhouse.us',
          subject: msgs.regMailSubject,
          text: msgs.regMailText.replace('{1}', formData.name)
        });
      });
    }
    return '';
  })
  .catch(error => renderError(error, request, response));
});

router.get('/deregister', (request, response) => {
  const msgs = response.locals.msgs;
  const usrRow = request.session.usr.rows[0];
  sgMail.send({
    to: {
      email: usrRow.email,
      name: usrRow.name.replace(/[,;]/g, '-')
    },
    cc: {
      email: 'info@berkhouse.us',
      name: 'Jonathan Pool'
    },
    from: 'info@berkhouse.us',
    subject: msgs.deregMailSubject,
    text: msgs.deregMailText.replace('{1}', usrRow.name)
  });
  DbUser.deleteUsr(request.session.usr.rows[0].id)
  .then(() => {
    delete request.session.usr;
    delete request.session.id;
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
  DbUser.getUsr('uid', formData)
  .then(usr => {
    if (usr.rowCount) {
      if (!bcrypt.compareSync(formData.password, usr.rows[0].pwhash)) {
        response.render(
          'usr/login', {formError: msgs.errLogin, formData, msgs}
        );
        return '';
      }
      else {
        delete usr.rows[0].pwhash;
        request.session.usr = usr;
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
  delete request.session.id;
  msgs.status = '';
  response.render('usr/logout-ack', {msgs});
});

module.exports = router;
