const router = require('express').Router();

router.get('/', (request, response) => {
  let ifCurator = 'gone ',
    ifAnonymous = '',
    ifKnown = 'gone ';
  const sesUsr = request.session.usr;
  if (sesUsr) {
    ifAnonymous = 'gone ';
    ifKnown = '';
    if (sesUsr.cats.includes(Number.parseInt(process.env.CURATOR_GRP))) {
      ifCurator = '';
    }
  }
  const msgs = response.locals.msgs;
  response.render('home', {ifAnonymous, ifKnown, ifCurator, msgs});
});

module.exports = router;
