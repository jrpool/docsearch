// Utility database functions.

// Create a pool of clients configured for connection to the database.
const {Pool} = require('pg');
const pool = new Pool();

// Define a function that uses a client in the pool to execute a query.
exports.query = args => {
  return pool.query(args)
  .catch(error => setImmediate(() => {
    throw error;
  }));
};
