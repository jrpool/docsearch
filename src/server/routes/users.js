const DbContacts = require('../../db/contacts')
const DbUsers = require('../../db/users')
const {renderError} = require('../utils')
const router = require('express').Router()
const session = require('express-session')
const morgan = require('morgan')
const {isLoggedIn} = require('../utils')
const bcrypt = require('bcrypt');

const hash_password = password => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};


router.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'keyboard cat',
  cookie: {
    expires: 600000
  }
}));

router.get('/login', (request, response) => {
  response.render('login')
})

router.post('/login', isLoggedIn, (request, response, next) => {
  if (!request.body.username.length || !request.body.password.length) {
    response.send('Your username or password was missing!')
    return
  }
  let user = DbUsers.getLoginUser(request.body.username)
  let contacts = DbContacts.getContacts()
  Promise.all([user, contacts])
  .then( (value) => {
    request.session.user = user
    console.log(request.session)
    let user = value[0]
    let contacts = value[1]
    if (user !== null) {
      const storedPassword = user.hashed_password;
      if (bcrypt.compareSync(request.body.password, storedPassword)) {
        response.render(
          'contacts', {id: user.id, username: user.username, admin: user.admin, contacts: contacts}
        )
        return ''
      }
      else {
        response.send('Your username or password was invalid!')
        return ''
      }
    }
    else {
      response.send('Your username or password was invalid!')
      return ''
    }
  })
  .catch( error => renderError(error, response, response) )
})

router.get('/signup', (request, response) => {
  response.render('signup')
})

router.post('/signup', (request, response, next) => {
  if (request.body.password2 !== request.body.password1) {
    response.send('Your passwords are not identical!')
    return
  }
  request.body.password1 = hash_password(request.body.password1);
  request.body.password2 = '';
  DbUsers.checkUser(request.body)
  .then(user => {
    if (user !== null) {
      response.send('Somebody with that username is already registered!')
      return ''
    }
    else {
      const user = DbUsers.createUser(request.body)
      const contacts = DbContacts.getContacts()
      Promise.all([user, contacts])
      .then(values => {
        response.render('contacts', {contacts: values[1], user: values[0]})
      })
    }
  })
  .catch( error => renderError(error, response, response) )
})

module.exports = router
