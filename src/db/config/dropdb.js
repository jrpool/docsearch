// Import required environment variables.
require('dotenv').config();
const fs = require('fs');

// Create a database connection.
const {Client} = require('pg');
const client = new Client({database: 'postgres'});
const path = require('path');

// Define a function that deletes the db and the role of its owner.
const proc = () => {
  client.connect()
  .then(() => client.query(`DROP DATABASE IF EXISTS ${process.env.PGDATABASE}`))
  .then(() => client.query(`DROP ROLE IF EXISTS ${process.env.PGUSER}`))
  .then(() => client.end())
  .catch (error => {
    console.log('Error: ' + error);
    client.end();
  });
};

// Execute the function.
proc();

// Delete all sessions.
const sessionPath = path.join(__dirname, '../../../sessions');
fs.readdirSync(sessionPath)
.forEach(file => fs.unlinkSync(path.join(sessionPath, file)));
