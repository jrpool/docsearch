// Import required modules.
const DbUsr = require('../../db/usr');
const {renderError} = require('../util');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const mailSend = (usrs, subject, text) => {
  const options = {
    to: {users.map(usr => {
      email: usr.email,
      name: usr.name.replace(/[,;]/g, '-')
    })},
    cc: {
      email: process.env.REG_EMAIL,
      name: process.env.REG_NAME
    },
    from: {
      email: process.env.FROM_EMAIL,
      name: process.env.FROM_NAME
    },
    subject: msgs.regMailSubject,
    text: msgs.regMailText
  };
  sgMail.send(options);
};

module.exports = mailSend;
