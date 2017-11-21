// Create a database connection.
const {Client} = require('pg');
const client = new Client({database: 'postgres'});

// Define a function that creates role “solr” and a db “docsearch” owned by it.
const proc = () => {
  client.connect()
  .then(() => client.query('CREATE ROLE solr LOGIN'))
  .then(() => client.query(
    `COMMENT ON ROLE solr IS 'search-engine owner'`
  ))
  .then(() => client.query('CREATE DATABASE docsearch OWNER solr'))
  .then(() => client.query(
    `COMMENT ON DATABASE docsearch IS 'admin data for docsearch app'`
  ))
  .then(() => client.end())
  .catch (error => {
    console.log(error);
    client.end();
  });
};

// Execute the function.
proc();
