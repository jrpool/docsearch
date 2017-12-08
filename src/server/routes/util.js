// Import required modules.
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const renderError = function(error, request, response, mark) {
  console.log(
    `ERROR${mark ? ' (' + mark + ')' : ''}: ${error.message}\n\n${error.stack}`
  );
};

// Define a function to redirect the client to the home page.
const redirectHome = (request, response) => {
  response.redirect(`${process.env.LINK_PREFIX}/`);
}

// Define a function that logs the current user out.
const anonymizeUsr = (request, response) => {
  response.locals.msgs.status = '';
  delete request.session.usr;
  delete request.session.id;
  request.session.destroy(error => {
    if (error) {
      renderError(error, request, response, 'anonymizeUsr');
    }
  });
};

// Define a function that makes a name safe for an email header.
const emailSanitize = name => name.replace(/[,;]/g, '-');

/*
  Define a function that sends a message, ensuring (per SendGrid requirements)
  that all email addresses in the “to” and “cc” headers are unique. usrs is
  an array of the array elements of user records.
*/
const mailSend = (usrs, subject, text) => {
  if(usrs.length === 2 && usrs[1].email === usrs[0].email) {
    usrs.shift();
  }
  const options = {
    to: usrs.map(usr => ({
      email: usr.email,
      name: emailSanitize(usr.name)
    })),
    from: {
      email: process.env.FROM_EMAIL,
      name: process.env.FROM_NAME
    },
    subject,
    text
  };
  if(!usrs.map(usr => usr.email).includes(process.env.REG_EMAIL)) {
    options.cc = {
      email: process.env.REG_EMAIL,
      name: process.env.REG_NAME
    };
  }
  return sgMail.send(options)
  .then(() => '')
  .catch(error => console.log(error.toString()));
};

module.exports = {renderError, anonymizeUsr, mailSend};
