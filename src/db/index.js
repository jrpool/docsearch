// Utility database functions.

// Create a pool of clients configured for connection to the database.
const {Pool} = require('pg');
const pool = new Pool();

/*
  Define a function that uses a client in the pool to execute a query.
  Preconditions:
    0. There is exactly 1 argument, either a string or an object.
*/
exports.query = arg => {
  return pool.query(arg)
  .catch(error => setImmediate(() => {
    throw error;
  }));
};
