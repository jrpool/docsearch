/*
  User-management database functions.
  Preconditions:
    There are no more than 26 curators.
*/

const db = require('./');

// Define a function that returns all database data on a user.
const getUsr = basis => {
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
  return db.query(query)
  .then(usr => {
    if (usr.rowCount) {
      usr = usr.rows[0];
      return db.query({
        rowMode: 'array',
        values: [usr.id],
        text: 'SELECT cat FROM usrcat WHERE usr = $1 ORDER BY CAT'
      })
      .then(cats => {
        return [usr, cats.rowCount ? cats.rows.map(row => row[0]) : []];
      })
      .catch(error => setImmediate(() => {
        throw error;
      }));
    }
    else {
      return [{}, []];
    }
  })
  .then(deepUsr => deepUsr)
  .catch(error => setImmediate(() => {
    throw error;
  }));
};

// Define a function that returns whether a user is in a category.
const hasCat = (usrID, cat) => {
  return db.query({
    text: 'SELECT COUNT(cat) FROM usrcat WHERE usr = $1 AND cat = $2',
    values: [usrID, cat],
    rowMode: 'array'
  })
  .then(resultArray => resultArray.rows[0][0] || false)
  .catch(error => setImmediate(() => {
    throw error;
  }));
};

// Define a function that returns selected database data on all users.
const getUsrs = () => {
  return db.query('SELECT id, uid, name FROM usr ORDER BY id DESC')
  .then(usrs => usrs.rowCount ? usrs.rows : [])
  .catch(error => {
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
  return db.query({
    text: `
      INSERT INTO usr (regdate, uid, pwhash, name, email, misc)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `,
    values: [
      new Date().toISOString().slice(0, 10),
      formData.uid,
      formData.pwHash,
      formData.name,
      formData.email,
      misc.join(' ¶ ')
    ]
  })
  .then(usrArray => {
    const usr = usrArray.rows[0];
    if (isCurator) {
      return db.query({
        text: 'INSERT INTO usrcat VALUES ($1, $2)',
        values: [usr.id, process.env.CURATOR_CAT]
      })
      .then(() => true);
    }
    else {
      return false;
    }
  })
  .then(result => result)
  .catch(error => setImmediate(() => {
    throw error;
  }));
};

// Define a function that revises the data on a user.
const updateUsr = formData => {
  const cats = formData.cats;
  delete formData.cats;
  return db.query({
    text: `
      UPDATE usr SET
        uid = $2,
        name = $3,
        email = $4,
        misc = $5
      WHERE id = $1
    `,
    values: [
      Number.parseInt(formData.id),
      formData.uid,
      formData.name,
      formData.email,
      formData.misc
    ]
  })
  .then(() => db.query({
    text: 'DELETE FROM usrcat WHERE usr = $1',
    values: [formData.id]
  }))
  .then(() => {
    if (cats.length) {
      const assignments = cats.map(cat => `($1, ${cat})`).join(', ');
      db.query({
        text: `INSERT INTO usrcat VALUES ${assignments}`,
        values: [formData.id]
      });
    }
  })
  .then(() => '')
  .catch(error => setImmediate(() => {
    throw error;
  }));
};

/*
  Define a function that deletes all data from the database on a user. The
  deletion from table usr propagates to the user’s records in usrcat.
*/
const deleteUsr = id => {
  return db.query({
    text: 'DELETE FROM usr WHERE id = $1',
    values: [id]
  })
  .then(() => '')
  .catch(error => setImmediate(() => {
    throw error;
  }));
};

module.exports = {
  getUsr,
  hasCat,
  getUsrs,
  createUsr,
  updateUsr,
  deleteUsr,
};
