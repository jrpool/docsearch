// Import required modules.
const path = require('path');
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
  Define a function that deletes the application’s database and the roe that
  owns it.
*/
const proc = () => {
  client.connect()
  .then(() => client.query(`DROP DATABASE IF EXISTS ${process.env.PGDATABASE}`))
  .then(() => client.query(`DROP ROLE IF EXISTS ${process.env.PGUSER}`))
  .then(() => client.end())
  .catch (error => {
    client.end();
    throw error;
  });
};

// Execute the function.
proc();

// Delete all sessions.
const sessionPath = path.join(__dirname, '../../../sessions');
fs.readdirSync(sessionPath)
.forEach(file => fs.unlinkSync(path.join(sessionPath, file)));
