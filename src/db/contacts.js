const db = require('./db')

const createContact = function(contact){
  return db.query(`
    INSERT INTO
      contacts (first_name, last_name)
    VALUES
      ($1::text, $2::text)
    RETURNING
      *
    `,
    [
      contact.first_name,
      contact.last_name,
    ])
    .catch(error => error);
}

const getContacts = function(){
  return db.query(`
    SELECT
      *
    FROM
      contacts
    `, [])
    .catch(error => error);
}

const getContact = function(contactId){
  return db.one(`
    SELECT * FROM contacts WHERE id=$1::int LIMIT 1
    `,
    [contactId])
    .catch(error => error);
}

const deleteContact = function(contactId){
  return db.query(`
    DELETE FROM
      contacts
    WHERE
      id=$1::int
    `,
    [contactId])
    .catch(error => error);
}

const searchForContact = function(searchQuery){
  return db.query(`
    SELECT
      *
    FROM
      contacts
    WHERE
      lower(first_name || ' ' || last_name) LIKE $1::text
    `,
    [`%${searchQuery.toLowerCase().replace(/\s+/,'%')}%`])
    .catch(error => error);
}

module.exports = {
  createContact,
  getContacts,
  getContact,
  deleteContact,
  searchForContact
}
