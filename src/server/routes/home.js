const router = require('express').Router();

router.get('/', (request, response) => {
  if (request.session.user) {
    response.redirect('/docs');
  }
  else {
    response.render('home');
  }
});

module.exports = router;
