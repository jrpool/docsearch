/*
  User-management database functions.
  Preconditions:
    There are no more than 26 curators.
*/

// Create a client configured for connection to the “docsearch” database.
const {Client} = require('pg');

// Define a function that returns all database data on a user.
const getUsr = basis => {
  const client = new Client();
  return client.connect()
  .then(() => {
    const query = {};
    if (basis.type === 'id') {
      query.values = [basis.id];
      query.text = 'SELECT * FROM usr WHERE id = $1';
    }
    else if (basis.type === 'nat') {
      query.values = [basis.data.name, basis.data.email];
      query.text = 'SELECT * FROM usr WHERE name = $1 AND email = $2';
    }
    else if (basis.type === 'uid') {
      query.values = [basis.data.uid];
      query.text = 'SELECT * FROM usr WHERE uid = $1';
    }
    else {
      throw 'Error: basis.type';
    }
    return client.query(query)
    .then(usr => {
      if (usr.rowCount) {
        usr = usr.rows[0];
        return client.query({
          rowMode: 'array',
          values: [usr.id],
          text: 'SELECT cat FROM usrcat WHERE usr = $1 ORDER BY CAT'
        })
        .then(cats => [usr, cats.rowCount ? cats.rows.map(row => row[0]) : []]);
      }
      else {
        return [{}, []];
      }
    });
  })
  .catch(error => {
    client.end();
    throw error;
  });
};

// Define a function that returns whether a user is in a category.
const hasCat = (usrID, cat) => {
  const client = new Client();
  return client.connect()
  .then(() => {
    return client.query({
      text: `SELECT COUNT(cat) FROM usrcat WHERE usr = $1 AND cat = $2`,
      values: [usrID, cat],
      rowMode: 'array'
    })
    .then(result => result.rows[0][0] || false)
    .catch(error => {
      client.end();
      throw error;
    });
  })
  .catch(error => {
    client.end();
    throw error;
  });
};

// Define a function that returns selected database data on all users.
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

/*
  Define a function that adds records to the database on the user identified
  by the submitted registration form and returns whether the user is a curator.
*/
const createUsr = formData => {
  const excludedFromEtc = {
    name: 1,
    pwHash: 1,
    email: 1,
    password1: 1,
    password2: 1,
    admin: 1,
    submit: 1,
    uid: 1
  };
  const misc = [];
  let isCurator = false;
  if (formData.admin.includes(process.env.CURATOR_KEY)) {
    formData.admin = '';
    isCurator = true;
  }
  formData.uid = 'temp' + Math.ceil(
    Math.random() * 100 * process.env.TEMP_UID_MAX
  );
  for (const key in formData) {
    if (!excludedFromEtc.hasOwnProperty(key)) {
      misc.push(`${key}=${formData[key]}`);
    }
  }
  const client = new Client();
  return client.connect()
  .then(() => {
    return client.query(`
      INSERT INTO usr (regdate, uid, pwhash, name, email, misc)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [
      new Date().toISOString().slice(0, 10),
      formData.uid,
      formData.pwHash,
      formData.name,
      formData.email,
      misc.join(' ¶ ')
    ])
    .then(usr => usr.rows[0]);
  })
  .then(usr => {
    if (isCurator) {
      return client.query(
        `INSERT INTO usrcat VALUES ($1, $2)`,
        [usr.id, process.env.CURATOR_CAT]
      )
      .then(() => {
        client.end();
        return true;
      })
    }
    else {
      client.end();
      return false;
    }
  })
  .catch(error => {
    client.end();
    throw error;
  });
}

// Define a function that revises the data on a user.
const updateUsr = formData => {
  const cats = formData.cats;
  delete formData.cats;
  const client = new Client();
  return client.connect()
  .then(() => client.query({
    values: [
      Number.parseInt(formData.id),
      formData.uid,
      formData.name,
      formData.email,
      formData.misc
    ],
    text: `
      UPDATE usr SET
        uid = $2,
        name = $3,
        email = $4,
        misc = $5
      WHERE id = $1
    `
  }))
  .then(() => client.query({
    values: [formData.id],
    text: `DELETE FROM usrcat WHERE usr = $1`
  }))
  .then(() => {
    if (cats.length) {
      const assignments = cats.map(cat => `($1, ${cat})`).join(', ');
      return client.query({
        values: [formData.id],
        text: `INSERT INTO usrcat VALUES ${assignments}`
      });
    }
    else {
      return '';
    }
  })
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
  Define a function that deletes all data from the database on a user. The
  deletion from table usr propagates to the user’s records in usrcat.
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

module.exports = {
  getUsr,
  hasCat,
  getUsrs,
  createUsr,
  updateUsr,
  deleteUsr,
};
