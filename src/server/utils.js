const renderError = function(error, response, response){
  response.send(`ERROR: ${error.message}\n\n${error.stack}`)
}

function isLoggedIn(request, response, next) {
  if(!request.session.user) {
    response.redirect('/login')
  }
  next()
}

module.exports = {
  renderError,
  isLoggedIn
}
