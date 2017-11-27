/*
  User-management database functions.
  Preconditions:
    There are no more than 26 curators.
*/

// Import environment variables.
require('dotenv').config();

// Create a client configured for connection to the “docsearch” database.
const {Client} = require('pg');

// Define a function that returns database data on a user.
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
const getcats = () => {
  const client = new Client();
  return client.connect()
  .then(() => {
    return client.query('SELECT id, name FROM cat ORDER BY id');
  })
  .then(cats => {
    client.end();
    return cats.rowCount ? cats.rows : [];
  })
  .catch(error => {
    client.end();
    throw error;
  });
};

// // Define a function that returns a user’s categories.
// const getcatsOf = usr => {
//   const client = new Client();
//   return client.connect()
//   .then(() => {
//     return client.query({
//       text: 'SELECT cat FROM usrcat WHERE usr = $1 ORDER BY cat',
//       values: [usr],
//       rowMode: 'array'
//     });
//   })
//   .then(cats => {
//     client.end();
//     return cats.rowCount ? cats.rows.map(row => row[0]) : [];
//   })
//   .catch(error => {
//     client.end();
//     throw error;
//   });
// };

/*
  Define a function that adds data to the database on the user identified
  by the submitted registration form.
*/
const createUsr = formData => {
  const excludedFromEtc = {
    uidPref: 1,
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
  formData.uid = 'temp' + Math.ceil(Math.random() * 1000);
  for (const key in formData) {
    if (!excludedFromEtc.hasOwnProperty(key)) {
      claims.push(`${key}=${formData[key]}`);
    }
  }
  const client = new Client();
  return client.connect()
  .then(() => {
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
    ])
    .then(usr => usr.rows[0]);
  })
  .then(usr => {
    if (isCurator) {
      return client.query(
        `INSERT INTO usrcat VALUES ($1, $2)`,
        [usr.id, process.env.CURATOR_GRP]
      )
      .then(() => {
        client.end();
        return [true, formData.uid];
      })
    }
    else {
      client.end();
      return [false, formData.uid];
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
      formData.claims
    ],
    text: `
      UPDATE usr SET
        uid = $2,
        name = $3,
        email = $4,
        claims = $5
      WHERE id = $1
    `
  }))
  .then(() => client.query({
    values: [formData.id],
    text: `DELETE FROM usrcat WHERE usr = $1`
  }))
  .then(() => {
    const assignments = cats.map(cat => `($1, ${cat})`).join(', ');
    return client.query({
      values: [formData.id],
      text: `INSERT INTO usrcat VALUES ${assignments}`
    });
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
  Define a function that deletes data from the database on a user. The
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

// // Define a function that returns wheth
// const checkUsr = formData => {
//   const client = new Client();
//   return client.connect()
//   .then(() => {
//     return client.query({
//       values: [id, pwhash],
//       text: 'SELECT * FROM usr WHERE id = $1 AND pwhash = $2'
//     })
//   })
//   .then(usr => {
//     client.end();
//     return usr;
//   })
//   .catch(error => {
//     client.end();
//     throw error;
//   });
// };

// // Define a function that adds a user to a category, if not already in it.
// const encatUsr = (usr, cat) => {
//   const client = new Client();
//   return client.connect()
//   .then(() => {
//     return client.query({
//       values: [usr, cat],
//       text: `
//         INSERT INTO usrcat VALUES ($1, $2)
//         ON CONFLICT DO NOTHING
//         RETURNING usr
//       `
//     });
//   })
//   .then(usr => {
//     client.end();
//     return usr;
//   })
//   .catch(error => {
//     client.end();
//     throw error;
//   });
// };

module.exports = {
  getUsr,
  getUsrs,
  // getcats,
  createUsr,
  updateUsr,
  deleteUsr,
  // checkUsr,
  // encatUsr
};
