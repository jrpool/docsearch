const DbUser = require('../../db/usr');
const {renderError, errorMsg} = require('../util');
const router = require('express').Router();
const bcrypt = require('bcrypt');

const getHash = password => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

router.get('/register', (request, response) => {
  response.render('usr/register');
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
      'usr/register', {formError: errorMsg('need4RegFacts'), formData}
    );
    return;
  }
  if (formData.password2 !== formData.password1) {
    response.render(
      'usr/register', {formError: errorMsg('passwordsDiffer'), formData}
    );
    return;
  }
  formData.pwHash = getHash(formData.password1);
  DbUser.getUsr(formData.name, formData.email)
  .then(usr => {
    if (usr.rowCount) {
      response.render(
        'usr/register', {formError: errorMsg('alreadyUsr'), formData}
      );
      return '';
    }
    else {
      DbUser.createUsr(formData);
      response.render('usr/register-ack');
    }
  })
  .catch(error => renderError(error, request, response));
});

router.get('/login', (request, response) => {
  response.render('usr/login');
});

router.post('/login', (request, response) => {
  const formData = request.body;
  if (!formData.username.length || !formData.password.length) {
    renderMessage('missing2Credentials', response);
    return;
  }
  DbUser.getLoginUser(formData.username)
  .then(user => {
    if (user === null) {
      renderMessage('badLogin', response);
      return '';
    }
    const storedPassword = user.hashed_password;
    if (!bcrypt.compareSync(formData.password, storedPassword)) {
      renderMessage('badLogin', response);
      return '';
    }
    delete user.hashed_password;
    request.session.user = user;
  })
  .then(() => {
    response.redirect('/contacts');
  })
  .catch(error => renderError(error, request, response));
});

router.get('/logout', (request, response) => {
  delete request.session.user;
  delete request.session.id;
  response.redirect('/');
});

module.exports = router;
