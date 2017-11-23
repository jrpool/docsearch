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
  const formData = request.body;
  if (
    !formData.name
    || !formData.email
    || !formData.password1
    || !formData.password2
  ) {
    response.render(
      'usr/register', {formError: errorMsg('need4RegFacts'), formData, uiMsg}
    );
    return;
  }
  if (formData.password2 !== formData.password1) {
    response.render(
      'usr/register', {formError: errorMsg('passwordsDiffer'), formData, uiMsg}
    );
    return;
  }
  formData.pwHash = getHash(formData.password1);
  DbUser.getUsr('nat', formData)
  .then(usr => {
    if (usr.rowCount) {
      response.render(
        'usr/register', {formError: errorMsg('alreadyUsr'), formData, uiMsg}
      );
      return '';
    }
    else {
      DbUser.createUsr(formData);
      response.render('usr/register-ack', {uiMsg});
      sgMail.send({
        to: [{
          email: formData.email,
          name: formData.name.replace(/[,;]/g, '-')
        },
        {
          email: 'info@berkhouse.us',
          name: 'Jonathan Pool'
        }],
        from: 'info@berkhouse.us',
        subject: uiMsg('regMailSub'),
        text: uiMsg('regMailText').replace('{1}', formData.name)
      });
    }
  })
  .catch(error => renderError(error, request, response));
});

router.get('/login', (request, response) => {
  response.render('usr/login', {formData: '', uiMsg});
});

router.post('/login', (request, response) => {
  const formData = request.body;
  if (!formData.uid || !formData.password) {
    response.render(
      'usr/login', {formError: errorMsg('need2LoginFacts'), formData, uiMsg}
    );
    return '';
  }
  DbUser.getUsr('uid', formData)
  .then(usr => {
    if (usr.rowCount) {
      if (!bcrypt.compareSync(formData.password, usr.pwhash)) {
        response.render(
          'usr/login', {formError: errorMsg('badLogin'), formData, uiMsg}
        );
        return '';
      }
      else {
        delete usr.pwhash;
        request.session.usr = usr;
        response.render('usr/login-ack', {uiMsg});
      }
    }
    else {
      response.render(
        'usr/login', {formError: errorMsg('badLogin'), formData, uiMsg}
      );
      return '';
    }
  })
  .catch(error => renderError(error, request, response));
});

router.get('/logout', (request, response) => {
  delete request.session.user;
  delete request.session.id;
  response.redirect('/');
});

module.exports = router;
