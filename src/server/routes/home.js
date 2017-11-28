const router = require('express').Router();

router.get('/', (request, response) => {
  let ifCurator = 'gone ',
    ifAnonymous = '',
    ifKnown = 'gone ';
  const sesUsr = request.session.usr;
  if (request.session.usr) {
    ifAnonymous = 'gone ';
    ifKnown = '';
    if (request.session.cats.includes(
      Number.parseInt(process.env.CURATOR_CAT)
    )) {
      ifCurator = '';
    }
  }
  const msgs = response.locals.msgs;
  response.render('home', {ifAnonymous, ifKnown, ifCurator, msgs});
});

module.exports = router;
