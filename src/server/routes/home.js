const router = require('express').Router();

router.get('/', (request, response) => {
  response.render('home');
});

module.exports = router;
