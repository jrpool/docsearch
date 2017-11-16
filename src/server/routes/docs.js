const router = require('express').Router();
const {getRole/* , renderError, renderMessage */} = require('../util');

router.get('/', (request, response) => {
  const user = request.session.user;
  if (getRole(user) > -1) {
    response.redirect('/docs');
  }
  else {
    response.render('home');
  }
});

router.get('/docs', (request, response) => {
  const user = request.session.user;
  if (getRole(user) > -1) {
    response.render('docs', {user});
  }
  else {
    response.redirect('/');
  }
});

router.get('/add', (request, response) => {
  const user = request.session.user;
  if (getRole(user) > -1) {
    response.render('docs/add', {user});
  }
  else {
    response.redirect('/');
  }
});

module.exports = router;
