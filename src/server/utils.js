const DbUsers = require('../../db/users');

const isLoggedIn = (request, response, next) => {
  if(!request.session.user) {
    response.redirect('/');
  } else {
    next();
  }
};

const processSession = (request, response, next) => {
  DbUsers.sessionUser(request.sessionID)
  .then(user => {
    if (user === null) {
      next();
    }
    else {
      request.session.user = user;
      DbUsers.recordSession(request.sessionID, request.session.user.id);
    }
  })
  .then(() => {
    next();
  })
};

const renderError = function(error, request, response) {
  response.send(`ERROR: ${error.message}\n\n${error.stack}`);
};

module.exports = {isLoggedIn, processSession, renderError};
