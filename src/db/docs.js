const db = require('./');

/*
  Define a function that returns an array of arrays with elements 0 =
  user category, 1 = a right of users in the category on a directory (where
  0 = 'see', 1 = 'add', and 2 = 'del'), and 2 = directory relative to 'public',
  i.e. with 'demodocs' being the top-level directory).
*/
const catDirRights = () => {
  return db.query({
    text: 'SELECT * from permit',
    rowMode: 'array'
  })
  .then(result => result.rows)
  .catch(error => setImmediate(() => {
    throw error;
  }));
};

module.exports = {catDirRights};
