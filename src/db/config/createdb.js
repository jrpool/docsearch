// Import required modules.
const fs = require('fs');
const dotenv = require('dotenv');
const {Client} = require('pg');

/*
  Create a database connection, before importing environment variables from
  .env, so the connecting user is the process owner and not the value of
  PGUSER.
*/
const client = new Client({database: 'postgres'});

/*
  Import confidential environment variables, overriding any conflicting
  existing ones.
*/
Object.assign(process.env, dotenv.parse(fs.readFileSync('.env')));

/*
  Define a function that creates the application’s database and the role
  that owns it.
*/
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
  .catch (error => setImmediate(() => {
    client.end();
    throw error;
  }));
};

// Execute the function.
proc();
