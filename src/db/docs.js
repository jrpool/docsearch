// Document-management database functions.

// Import required modules.
const path = require('path');
const router = require('express').Router();
const fs = require('fs');

// Create a client configured for connection to the “docsearch” database.
const {Client} = require('pg');

/*
  Define a function that returns a user’s directory rights, where all users,
  in addition to any categories they are in, are deemed to be in the general public.
*/
const usrDirRights = usrID => {
  const client = new Client();
  const queryText = usrID
    ? `
      SELECT distinct permit.act, permit.dir FROM usrcat, permit
      WHERE usrcat.usr = $1
      AND permit.cat = usrcat.cat
      UNION
      SELECT act, dir FROM permit WHERE cat = ${process.env.PUBLIC_CAT}
    `
    : `SELECT act, dir FROM permit WHERE cat = ${process.env.PUBLIC_CAT}`;
  const query = {
    text: queryText,
    rowMode: 'array'
  };
  if (usrID) {
    query.values = [usrID];
  }
  return client.connect()
  .then(() => client.query(query))
  .then(result => {
    client.end();
    return result.rows;
  })
  .catch(error => {
    client.end();
    throw error;
  });
};

module.exports = {usrDirRights};
