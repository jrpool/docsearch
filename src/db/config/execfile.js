// Import required modules.
const fs = require('fs');
const path = require('path');

// Create a connection to the “docsearch” database.
const {Client} = require('pg');
const client = new Client();

// Define a function that executes the specified query file.
const proc = () => {
  const queries = fs.readFileSync(
    path.join(__dirname, `${process.argv[2]}.sql`), 'utf8'
  );
  client.connect()
  .then(() => {
    return client.query(queries);
  })
  .then(() => client.end())
  .catch (error => {
    console.log(error);
    client.end();
  });
};

// Execute the function.
proc();
