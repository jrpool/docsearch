// Import required modules.
require('dotenv').config();

// Create a connection to the “docsearch” database.
const {Client} = require('pg');

const getUsr = (name, email) => {
  const client = new Client();
  return client.connect()
  .then(() => {
    return client.query({
      values: [name,email],
      text: 'SELECT * FROM usr WHERE name = $1 AND email = $2'
    })
  })
  .then(usr => {
    client.end();
    return usr;
  })
  .catch(error => {
    client.end();
    return error;
  });
};

const createUsr = formUsr => {
  const excludedFromEtc = {
    name: 1,
    pwHash: 1,
    email: 1,
    password1: 1,
    password2: 1
  };
  const etcfacts = [];
  for (const key in formUsr) {
    if (!excludedFromEtc.hasOwnProperty(key)) {
      etcfacts.push(`${key}=${formUsr[key]}`);
    }
  }
  const client = new Client();
  return client.connect()
  .then(() => {
    return client.query(`
      INSERT INTO usr (pwhash, name, email, facts) VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [
      formUsr.pwHash,
      formUsr.name,
      formUsr.email,
      etcfacts.join(' ¶ ')
    ])
  })
  .then(usr => {
    client.end();
    return usr;
  })
  .catch(error => {
    client.end();
    throw error;
  });
};

module.exports = {
  getUsr,
  createUsr
};
