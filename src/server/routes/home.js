const router = require('express').Router();

router.get('/', (request, response) => {
  let ifCurator = 'gone ',
    ifAnonymous = '',
    ifKnown = 'gone ';
  const usr = request.session.usr;
  if (usr) {
    ifAnonymous = 'gone ';
    ifKnown = '';
    if (usr.grps.includes(7)) {
      ifCurator = '';
    }
  }
  const msgs = response.locals.msgs;
  response.render('home', {ifAnonymous, ifKnown, ifCurator, msgs});
});

module.exports = router;
