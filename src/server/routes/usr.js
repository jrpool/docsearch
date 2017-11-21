const DbUser = require('../../db/usr');
const {renderError, renderMessage} = require('../util');
const router = require('express').Router();
const bcrypt = require('bcrypt');

const hash_password = password => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

router.get('/register', (request, response) => {
  response.render('usr/register');
});

router.get('/login', (request, response) => {
  response.render('usr/login');
});

router.post('/signup', (request, response) => {
  const formData = request.body;
  if (!formData.username || !formData.password1 || !formData.password2) {
    renderMessage('missing3Credentials', response);
    return;
  }
  if (formData.password2 !== formData.password1) {
    renderMessage('passwordsDiffer', response);
    return;
  }
  formData.password1 = hash_password(formData.password1);
  formData.password2 = '';
  if (!formData.admin) {
    formData.admin = false;
  }
  DbUser.checkUser(formData)
  .then(user => {
    if (user !== null) {
      renderMessage('alreadyUser', response);
      return '';
    }
    else {
      const userPromise = DbUser.createUser(formData);
      const contactsPromise = DbUser.getContacts();
      Promise.all([userPromise, contactsPromise])
      .then(valueArray => {
        request.session.user = {
          username: valueArray[0].username, admin: valueArray[0].admin
        };
        response.redirect('/contacts');
      });
    }
  })
  .catch(error => renderError(error, request, response));
});

router.get('/login', (request, response) => {
  if (request.session.user) {
    response.redirect('/contacts');
  }
  else {
    response.render('login');
  }
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
