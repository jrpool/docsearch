const router = require('express').Router();

// Home page.
router.get('/', (request, response) => {
  let ifCurator = 'class="gone" ',
    ifAnonymous = '',
    ifKnown = 'class="gone" ';
  const usr = response.locals.usr;
  if (usr[0].id) {
    ifAnonymous = 'class="gone" ';
    ifKnown = '';
    if (usr[1].includes(
      Number.parseInt(process.env.CURATOR_CAT)
    )) {
      ifCurator = '';
    }
  }
  response.render('home', {ifAnonymous, ifKnown, ifCurator});
});

module.exports = router;
