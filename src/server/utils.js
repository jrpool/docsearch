const renderError = function(error, response, response){
  response.send(`ERROR: ${error.message}\n\n${error.stack}`)
}

function isLoggedIn(request, response, next) {
  if(!request.session.user) {
    response.render('login')
  }
  next()
}

const mustBeAdmin = {
  viewContacts: false,
  viewContact: false,
  createContact: true,
  deleteContact: true
}

const userHasAccess = ( user, action ) => {
  const role = user.admin
  const allActions = Object.keys( mustBeAdmin )
  return role || !mustBeAdmin[action]
}

module.exports = {
  renderError,
  isLoggedIn,
  userHasAccess
}
