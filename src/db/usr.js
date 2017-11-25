/*
  User-management database functions.
  Preconditions:
    The curator group has ID 7.
    There is a maximum of 26 curators.
*/

// Import required modules.
require('dotenv').config();

// Create a connection to the “docsearch” database.
const {Client} = require('pg');

/*
  Define a function that returns database data on the user identified
  by the submitted login form, including an array of the user’s groups.
*/
const getUsr = (basis, formData) => {
  const client = new Client();
  return client.connect()
  .then(() => {
    const query = {};
    if (basis === 'nat') {
      query.values = [formData.name, formData.email];
      query.text = `
        SELECT usr.*, array_agg(usrgrp.grp) AS grps FROM usr, usrgrp
        WHERE usr.name = $1 AND usr.email = $2 AND usrgrp.usr = usr.id
        GROUP BY usr.id
      `;
    }
    else if (basis === 'uid') {
      query.values = [formData.uid];
      query.text = `
        SELECT usr.*, array_agg(usrgrp.grp) AS grps FROM usr, usrgrp
        WHERE usr.uid = $1 AND usrgrp.usr = usr.id
        GROUP BY usr.id
      `;
    }
    return client.query(query);
  })
  .then(usr => {
    client.end();
    return usr.rowCount ? usr.rows[0] : [];
  })
  .catch(error => {
    client.end();
    throw error;
  });
};

/*
  Define a function that adds data to the database on the user identified
  by the submitted registration form.
*/
const createUsr = formData => {
  const excludedFromEtc = {
    name: 1,
    pwHash: 1,
    email: 1,
    password1: 1,
    password2: 1
  };
  const etcfacts = [];
  const curatorKey = process.env.CURATOR_KEY;
  let isCurator = false;
  if (formData.etc.includes(curatorKey)) {
    formData.etc = formData.etc.replace(curatorKey, '');
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
  // If registrant is a curator, identify the last-used curator UID.
  const client = new Client();
  return client.connect()
  .then(() => {
    if (isCurator) {
      return client.query({
        text: `
          SELECT COALESCE(min(uid), '') FROM usrgrp, usr
          WHERE usrgrp.grp = 7 and usr.id = usrgrp.usr AND usr.uid LIKE '1Z_'
        `,
        rowMode: 'array'
      })
    }
    else {
      return '';
    }
  })
  // If registrant is a curator, identify the next available curator UID.
  .then(result => {
    if (isCurator) {
      const lastUsedUID = result.rows[0][0];
      if (lastUsedUID) {
        formData.uid
          = `1Z${String.fromCharCode(lastUsedUID.charCodeAt(2) - 1)}`;
        }
        else {
          formData.uid = '1ZZ';
        }
    }
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
    ]);
  })
  .then(usr => {
    if (isCurator) {
      return client.query(`INSERT INTO usrgrp SELECT $1, 7`, [usr.rows[0].id])
      .then(() => {
        client.end();
        return formData.uid;
      })
    }
    else {
      client.end();
      return '';
    }
  })
  .catch(error => {
    client.end();
    throw error;
  });
}

/*
  Define a function that deletes data from the database on the user
  identified by the submitted deregistration form.
*/
const deleteUsr = id => {
  const client = new Client();
  return client.connect()
  .then(() => {return client.query(`DELETE FROM usr WHERE id = $1`, [id]);})
  .then(() => {
    client.end();
    return '';
  })
  .catch(error => {
    client.end();
    throw error;
  });
}

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

// Define a function that adds a user to a group, if not already in it.
const engrpUsr = (usr, grp) => {
  const client = new Client();
  return client.connect()
  .then(() => {
    return client.query({
      values: [usr, grp],
      text: `
        INSERT INTO usrgrp VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        RETURNING usr
      `
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

module.exports = {getUsr, createUsr, deleteUsr, checkUsr, engrpUsr};
