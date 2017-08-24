const renderError = function(error, request, response) {
  response.send(`ERROR: ${error.message}\n\n${error.stack}`);
};

function isLoggedIn(request, response, next) {
  if(!request.session || !request.session.user) {
    response.render('login');
  } else {
    next();
  }
}

const mustBeAdmin = {
  viewContacts: false,
  viewContact: false,
  "/new": true,
  `/:contactId/delete`: true
};

const userHasAccess = (request, response, next) => {
  const isAdmin = request.session.user.admin;
  const path = request.route.path;
  return isAdmin || !mustBeAdmin[path];
};

module.exports = {
  renderError,
  isLoggedIn,
  userHasAccess
};
