const renderError = function(error, request, response) {
  response.send(`ERROR: ${error.message}\n\n${error.stack}`);
};

function isLoggedIn(request, response, next) {
  if(!request.session || !request.session.user) {
    response.render('login');
  }
  next();
}

const mustBeAdmin = {
  viewContacts: false,
  viewContact: false,
  createContact: true,
  deleteContact: true
};

const userHasAccess = (user, action) => {
  const isAdmin = user.admin;
  return isAdmin || !mustBeAdmin[action];
};

module.exports = {
  renderError,
  isLoggedIn,
  userHasAccess
};
