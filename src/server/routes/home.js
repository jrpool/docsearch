const router = require('express').Router();
const contacts = require('./contacts')
const DbContacts = require('../../db/contacts');

router.get('/', (request, response) => {
  response.render('home')
})

router.use('/contacts', contacts); // /contacts/search

module.exports = router;
