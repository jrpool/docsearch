// Create a client configured for connection to the “docsearch” database.
const {Client} = require('pg');

/*
  Define a function that returns an array of arrays with elements 0 =
  user category, 1 = a right of users in the category on a directory (where
  0 = 'see', 1 = 'add', and 2 = 'del'), and 2 = directory relative to 'public',
  i.e. with 'demodocs' being the top-level directory).
*/
const catDirRights = () => {
  const client = new Client();
  return client.connect()
  .then(() => client.query({
    text: 'SELECT * from permit',
    rowMode: 'array'
  }))
  .then(result => {
    client.end();
    return result.rows;
  })
  .catch(error => {
    client.end();
    throw error;
  });
};

module.exports = {catDirRights};
