// Import required modules.
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a connection to the “docsearch” database.
const {Client} = require('pg');
const client = new Client();

// Define a function that executes the specified query file.
const proc = () => {
  const queries = fs.readFileSync(
    path.join(
      process.cwd(),
      `${process.argv[2].replace('{1}', process.env.SEED_DIR + '/')}.sql`
    ), 'utf8'
  );
  client.connect()
  .then(() => {
    return client.query(queries);
  })
  .then(() => client.end())
  .catch (error => {
    client.end():
    throw error;
  });
};

// Execute the function.
proc();
