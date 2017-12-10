// Import required modules.
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const {Client} = require('pg');

/*
  Import confidential environment variables, overriding any conflicting
  existing ones.
*/
Object.assign(process.env, dotenv.parse(fs.readFileSync('.env')));

// Create a connection to the application’s database by its owner.
const client = new Client();

/*
  Define a function that executes the specified query file in the seed directory.
*/
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
    client.end();
    throw error;
  });
};

// Execute the function.
proc();
