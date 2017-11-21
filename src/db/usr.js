// Import required modules.
require('dotenv').config();

// Create a connection to the “docsearch” database.
const {Client} = require('pg');
const client = new Client();

const getEmailUsr = email => {
  return client.query(`SELECT * FROM usr WHERE email = '${email}'`)
  .catch(error => error);
};

const getUsrUsr = usr => {
  return client.query(`SELECT * FROM usr WHERE email = '${usr.email}'`)
  .catch(error => error);
};

const createUsr = usr => {
  return client.query(`
    INSERT INTO
      usr (pwdhash, name, email, facts)
    VALUES
      (
        $1::VARCHAR(255),
        $2::VARCHAR(40),
        $3::VARCHAR(50),
        $4::VARCHAR(127),
      )
    RETURNING
      *
    `,
    [
      usr.pwdhash,
      usr.name,
      usr.email,
      usr.facts
    ])
  .catch(error => error);
};

module.exports = {
  getEmailUsr,
  getUsrUsr,
  createUsr
};
