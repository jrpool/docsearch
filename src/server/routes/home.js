const router = require('express').Router();

router.get('/', (request, response) => {
  let ifAnonymous = '';
  let ifKnown = 'gone ';
  if (request.session.usr) {
    ifAnonymous = 'gone ';
    ifKnown = '';
  }
  const msgs = response.locals.msgs;
  response.render('home', {ifAnonymous, ifKnown, msgs});
});

module.exports = router;
