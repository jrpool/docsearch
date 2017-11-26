const {getUpdateQuery} = require('./util');

/*
  User-management database functions.
  Preconditions:
    There is a maximum of 26 curators.
*/

// Import required modules.
require('dotenv').config();

// Create a connection to the “docsearch” database.
const {Client} = require('pg');

// Define a function that returns database data on a user.
const getUsr = id => {
  const client = new Client();
  return client.connect()
  .then(() => {
    return client.query({
      values: [id],
      text: `
        SELECT usr.*, array_agg(usrgrp.grp) AS grps FROM usr, usrgrp
        WHERE usr.id = $1 AND usrgrp.usr = usr.id
        GROUP BY usr.id
      `
    });
  })
  .then(usr => {
    client.end();
    return usr.rowCount ? usr.rows[0] : {};
  })
  .catch(error => {
    client.end();
    throw error;
  });
};

/*
  Define a function that returns database data on the user identified
  by the submitted login form, including an array of the user’s groups.
*/
const getFormUsr = (basis, formData) => {
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
    return usr.rowCount ? usr.rows[0] : {};
  })
  .catch(error => {
    client.end();
    throw error;
  });
};

// Define a function that returns database data on all users.
const getUsrs = () => {
  const client = new Client();
  return client.connect()
  .then(() => {
    return client.query('SELECT id, uid, name FROM usr ORDER BY id DESC');
  })
  .then(usrs => {
    client.end();
    return usrs.rowCount ? usrs.rows : [];
  })
  .catch(error => {
    client.end();
    throw error;
  });
};

// Define a function that returns database data on all user categories.
const getGrps = () => {
  const client = new Client();
  return client.connect()
  .then(() => {
    return client.query('SELECT id, name FROM grp ORDER BY id');
  })
  .then(grps => {
    client.end();
    return grps.rowCount ? grps.rows : [];
  })
  .catch(error => {
    client.end();
    throw error;
  });
};

// Define a function that returns a user’s categories.
const getGrpsOf = usr => {
  const client = new Client();
  return client.connect()
  .then(() => {
    return client.query({
      text: 'SELECT grp FROM usrgrp WHERE usr = $1 ORDER BY grp',
      values: [usr],
      rowMode: 'array'
    });
  })
  .then(grps => {
    client.end();
    return grps.rowCount ? grps.rows.map(row => row[0]) : [];
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
    password2: 1,
    submit: 1
  };
  const claims = [];
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
      claims.push(`${key}=${formData[key]}`);
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
          WHERE usrgrp.grp = $1
          AND usr.id = usrgrp.usr
          AND usr.uid LIKE '1Z_'
        `,
        values: [Number.parseInt(process.env.CURATOR_GRP)],
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
      INSERT INTO usr (uid, pwhash, name, email, claims)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      formData.uid,
      formData.pwHash,
      formData.name,
      formData.email,
      claims.join(' ¶ ')
    ]);
  })
  .then(usr => {
    if (isCurator) {
      return client.query(
        `INSERT INTO usrgrp VALUES ($1, $2)`,
        [usr.rows[0].id, process.env.CURATOR_GRP]
      )
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
  Define a function that revises the data on a user.
*/
const updateUsr = usr => {
  const grps = usr.grps;
  delete usr.grps;
  const client = new Client();
  return client.connect()
  .then(() => client.query(getUpdateQuery('usr', ['id', usr.id], usr)))
  .then(() => {
    client.end();
    return '';
  })
  .catch(error => {
    client.end();
    throw error;
  });
};

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

module.exports = {
  getUsr,
  getFormUsr,
  getUsrs,
  getGrps,
  createUsr,
  updateUsr,
  deleteUsr,
  checkUsr,
  engrpUsr
};
