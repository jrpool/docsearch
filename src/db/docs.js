// Create a client configured for connection to the “docsearch” database.
const {Client} = require('pg');

// Define a function that returns the directory rights of users in categories.
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
