// Import required modules.
require('dotenv').config();

// Create a connection to the “docsearch” database.
const {Client} = require('pg');

const getUsr = (basis, formData) => {
  const client = new Client();
  return client.connect()
  .then(() => {
    const query = {};
    if (basis === 'nat') {
      query.values = [formData.name, formData.email];
      query.text = 'SELECT * FROM usr WHERE name = $1 AND email = $2';
    }
    else if (basis === 'uid') {
      query.values = [formData.uid];
      query.text = 'SELECT * FROM usr WHERE uid = $1';
    }
    return client.query(query);
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

const createUsr = formData => {
  const excludedFromEtc = {
    name: 1,
    pwHash: 1,
    email: 1,
    password1: 1,
    password2: 1
  };
  const etcfacts = [];
  const curatorKey = process.env.curatorKey;
  let isCurator = false;
  if (formData.etc.includes(curatorKey)) {
    formData.etc.replace(/curatorKey */, '');
    formData.uid = '1ZZ',
    isCurator = true;
  }
  else {
    formData.uid = null;
  }
  for (const key in formData) {
    if (!excludedFromEtc.hasOwnProperty(key)) {
      etcfacts.push(`${key}=${formData[key]}`);
    }
  }
  const client = new Client();
  return client.connect()
  .then(() => {
    return client.query(`
      INSERT INTO usr (uid, pwhash, name, email, facts)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      formData.uid,
      formData.pwHash,
      formData.name,
      formData.email,
      etcfacts.join(' ¶ ')
    ])
  })
  .then(usr => {
    if (isCurator) {
      client.query(`
        INSERT INTO usrgrp SELECT $1, id FROM grp WHERE name = 'curator'
      `, [
        usr.id
      ]);
      return usr;
    }
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

const checkUsr = formData => {
  const client = new Client();
  return client.connect()
  .then(() => {
    return client.query({
      values: [id, pwhash],
      text: 'SELECT * FROM usr WHERE id = $1 AND pwhash = $2'
    })
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

const engroupUsr = (usr, grp) => {
  const client = new Client();
  return client.connect()
  .then(() => {
    return client.query({
      values: [usr, grp],
      text:
        'INSERT INTO usrgrp VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING usr'
    });
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

module.exports = {getUsr, createUsr, checkUsr};
