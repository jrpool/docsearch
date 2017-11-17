const db = require('../db/db');

const getRole = (request) => {
  return request.session.user.role || -1;
};

const renderError = function(error, request, response) {
  response.send(`ERROR: ${error.message}\n\n${error.stack}`);
};

const renderMessage = function(messageType, response) {
  const messageTypes = {
    badLogin: 'Your username-password combination was invalid.',
    noAuth: 'Log out and sign up as an admin to do this.',
    alreadyUser: 'Someone with that username is already registered.',
    passwordsDiffer: 'The passwords are not identical.',
    missing2Credentials: 'Both a username and a password are required.',
    missing3Credentials: 'A username and duplicate passwords are required.',
    otherwise: 'Something was wrong with the inputs.'
  };
  response.send(messageTypes[messageType] || messageTypes.otherwise);
};

const roleDirs = async roles => {
  const allRoleDirs = await db.pool.query('SELECT role, dir FROM roledirs');
  return allRoleDirs.reduce((dirs, v) => {
    
  },[])
};

module.exports = {getRole, renderError, renderMessage};
