const router = require('express').Router();

router.get('/', (request, response) => {
console.log("Home========>",request.sessionID)
  if (request.session && request.session.user) {
    response.redirect('/contacts');
  }
  else {
    response.render('home');
  }
});

module.exports = router;
