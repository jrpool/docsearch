const router = require('express').Router();

router.get('/', (request, response) => {
  console.log('request path is ' + request.path);
  let ifCurator = 'class="gone" ',
    ifAnonymous = '',
    ifKnown = 'class="gone" ';
  const sesUsr = request.session.usr;
  if (request.session.usr) {
    ifAnonymous = 'class="gone" ';
    ifKnown = '';
    if (request.session.cats.includes(
      Number.parseInt(process.env.CURATOR_CAT)
    )) {
      ifCurator = '';
    }
  }
  response.render('home', {ifAnonymous, ifKnown, ifCurator});
});

module.exports = router;
