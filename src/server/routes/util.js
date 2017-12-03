// Import required modules.
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const renderError = function(error, request, response, mark) {
  console.log(
    `ERROR${mark ? ' (' + mark + ')' : ''}: ${error.message}\n\n${error.stack}`
  );
};

// Define a function that makes a name safe for an email header.
const emailSanitize = name => name.replace(/[,;]/g, '-');

/*
  Define a function that sends a message, ensuring (per SendGrid requirements)
  that all email addresses in the “to” and “cc” headers are unique.
*/
const mailSend = (usrs, subject, text, msgs) => {
  if(usrs.length === 2 && usrs[1][0].email === usrs[0][0].email) {
    usrs.shift();
  }
  const options = {
    to: usrs.map(usr => ({
      email: usr[0].email,
      name: emailSanitize(usr[0].name)
    })),
    from: {
      email: process.env.FROM_EMAIL,
      name: process.env.FROM_NAME
    },
    subject,
    text
  };
  if(!usrs.map(usr => usr[0].email).includes(process.env.REG_EMAIL)) {
    options.cc = {
      email: process.env.REG_EMAIL,
      name: process.env.REG_NAME
    };
  }
  return sgMail.send(options)
  .then(() => '')
  .catch(error => console.log(error.toString()));
};

module.exports = {renderError, mailSend};
