const DbContacts = require('../../db/users')
const {renderError} = require('../utils')

const router = require('express').Router()

router.get('/login', (request, response) => {
  response.render('login')
})

router.get('/signup', (request, response) => {
  response.render('signup')
})

router.post('/', (request, response, next) => {
  DbContacts.createContact(request.body)
    .then(function(contact) {
      if (contact) return response.redirect(`/contacts/${contact[0].id}`)
      next()
    })
    .catch( error => renderError(error, response, response) )
})

module.exports = router
