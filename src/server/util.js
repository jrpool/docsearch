const renderError = function(error, request, response) {
  response.send(`ERROR: ${error.message}\n\n${error.stack}`);
};

const errorMsg = function(messageKey) {
  const messageKeys = {
    badLogin: 'Your ID-password combination was invalid.',
    alreadyUsr: 'Someone with that name and email address is already registered.',
    passwordsDiffer: 'The passwords are not identical.',
    need2LoginFacts: 'Both an ID and a password are required.',
    need4RegFacts: 'A name, an email address, and duplicate passwords are required.',
    otherwise: 'Something was wrong with the inputs.'
  };
  return messageKeys[messageKey] || messageKeys.otherwise;
};

const uiMsg = function(messageKey) {
  const messageKeys = {
    home: 'Home',
    regAck: 'Thank you! Your registration request has been received. You should receive an immediate email confirmation and be contacted later for verification.',
    regMailSub: 'Registration at berkhouse.us',
    regMailText: `This confirms the registration of {1} at http://berkhouse.us. Please wait to receive an ID. Once you receive it, you will be able to log in there. Thanks!`,
    regRcvd: 'Registration Request Received'
  };
  return messageKeys[messageKey] || messageKeys.otherwise;
};

module.exports = {renderError, errorMsg, uiMsg};
