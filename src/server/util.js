const renderError = function(error, request, response) {
  response.send(`ERROR: ${error.message}\n\n${error.stack}`);
};

const errorMsg = function(messageKey) {
  const messageKeys = {
    badLogin: 'Your username-password combination was invalid.',
    noAuth: 'Log out and sign up as an admin to do this.',
    alreadyUsr: 'Someone with that name and email address is already registered.',
    passwordsDiffer: 'The passwords are not identical.',
    missing2Credentials: 'Both a username and a password are required.',
    need4RegFacts: 'A name, an email address, and duplicate passwords are required.',
    otherwise: 'Something was wrong with the inputs.'
  };
  return messageKeys[messageKey] || messageKeys.otherwise;
};

module.exports = {renderError, errorMsg};
