// Utility database functions.

// Create a pool of clients configured for connection to the database.
const {Pool} = require('pg');
const pool = new Pool();

// Define a function that uses a client in the pool to execute a query.
const query = args => {
  return pool.query(args)
  .catch(error => setImmediate(() => {
    throw error;
  }));
};

// Define a function that terminates the pool.
const end = () => {
  return pool.end()
  .catch(error => setImmediate(() => {
    throw error;
  }));
};

module.exports = {end, query};
