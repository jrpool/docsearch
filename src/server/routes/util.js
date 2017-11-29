// Import required modules.
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const renderError = function(error, request, response) {
  response.send(`ERROR: ${error.message}\n\n${error.stack}`);
};

/*
  Send a message, ensuring (per SendGrid requirements) that all email addresses
  in the “to” and “cc” headers are unique.
*/
const mailSend = (usrs, subject, text, msgs) => {
  if(usrs.length === 2 && usrs[1].email === usrs[0].email) {
    usrs.shift();
  }
  const options = {
    to: usrs.map(usr => ({
      email: usr.email,
      name: usr.name.replace(/[,;]/g, '-')
    })),
    from: {
      email: process.env.FROM_EMAIL,
      name: process.env.FROM_NAME
    },
    subject: msgs.regMailSubject,
    text: msgs.regMailText
  };
  if(!usrs.map(usr => usr.email).includes(process.env.REG_EMAIL)) {
    options.cc = {
      email: process.env.REG_EMAIL,
      name: process.env.REG_NAME
    };
  }
  sgMail.send(options)
  .catch(error => console.log(error.toString()));
};

module.exports = {renderError, mailSend};
