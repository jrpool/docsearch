const DbContacts = require('../../db/contacts');
const DbUsers = require('../../db/users');
const {renderError} = require('../utils');
const router = require('express').Router();
const bcrypt = require('bcrypt');

const hash_password = password => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

router.get('/login', (request, response) => {
  if (request.session.user) {
    response.redirect('/contacts');
  }
  else {
    response.render('login');
  }
});

router.post('/login', (request, response) => {
  const missingReport = 'Your username or password was missing!';
  const wrongReport = 'Your username or password was invalid!';
  const giveReport = report => {response.send(report);};
  const formData = request.body;
  if (!formData.username.length || !formData.password.length) {
    giveReport(missingReport);
    return;
  }
  const userPromise = DbUsers.getLoginUser(formData.username);
  const contactsPromise = DbContacts.getContacts();
  Promise.all([userPromise, contactsPromise])
  .then(valueArray => {
    const user = valueArray[0];
    if (user === null) {
      giveReport(wrongReport);
      return '';
    }
    const storedPassword = user.hashed_password;
    if (!bcrypt.compareSync(formData.password, storedPassword)) {
      giveReport(wrongReport);
      return '';
    }
    request.session.user = {username: user.username, admin: user.admin};
    response.redirect('/contacts');
  })
  .catch(error => renderError(error, request, response));
});

router.get('/signup', (request, response) => {
  response.render('signup');
});

router.post('/signup', (request, response) => {
  const formData = request.body;
  if (formData.password2 !== formData.password1) {
    response.send('Your passwords are not identical!');
    return;
  }
  formData.password1 = hash_password(formData.password1);
  formData.password2 = '';
  if (!formData.admin) {
    formData.admin = false;
  }
  DbUsers.checkUser(formData)
  .then(user => {
    if (user !== null) {
      response.send('Somebody with that username is already registered!');
      return '';
    }
    else {
      const userPromise = DbUsers.createUser(formData);
      const contactsPromise = DbContacts.getContacts();
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

router.get('/logout', (request, response, next) => {
  request.session.user = {};
  DbUsers.killSession(request.sessionID)
  .then(() => {
    request.sessionID = '';
    response.redirect('/');
  })
});

module.exports = router;
