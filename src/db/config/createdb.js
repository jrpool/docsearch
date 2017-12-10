// Import required environment variables.
require('dotenv').config();
const fs = require('fs');

// Create a database connection.
const {Client} = require('pg');
const client = new Client({database: 'postgres'});

// Define a function that creates a role and a db owned by it.
const proc = () => {
  client.connect()
  .then(() => client.query(`CREATE ROLE ${process.env.PGUSER} LOGIN`))
  .then(() => client.query(
    `COMMENT ON ROLE ${process.env.PGUSER} IS 'docsearch app owner'`
  ))
  .then(() => client.query(
    `CREATE DATABASE ${process.env.PGDATABASE} OWNER ${process.env.PGUSER}`
  ))
  .then(() => client.query(`
    COMMENT ON DATABASE ${process.env.PGDATABASE} IS
    'admin data for docsearch app'
  `))
  .then(() => client.end())
  .catch (error => {
    console.log('Error: ' + error);
    client.end();
  });
};

// Execute the function.
proc();
