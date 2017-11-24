// Create a database connection.
const {Client} = require('pg');
const client = new Client({database: 'postgres'});
const fs = require('fs');
const path = require('path');

// Define a function that deletes db “docsearch” and the role of its owner.
const proc = () => {
  client.connect()
  .then(() => client.query('DROP DATABASE IF EXISTS docsearch'))
  .then(() => client.query('DROP ROLE IF EXISTS solr'))
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
