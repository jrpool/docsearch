const db = require('./db')

const checkUser = user => {
  return db.oneOrNone(
    `SELECT * FROM member WHERE username = '${user.username}'`
  )
  .catch(error => error);
}

const createUser = user => {
  return db.oneOrNone(`
    INSERT INTO
      member (username, hashed_password)
    VALUES
      ($1::text, $2::text)
    RETURNING
      *
    `,
    [
      user.username,
      user.password1,
    ])
    .catch(error => error);
}

// const validateUser = user => {
//   return db.oneOrNone(
//     `SELECT * FROM member
//     WHERE username = '${user.username}'
//     AND hashed_password = '${user.password}'`
//   )
//   .catch(error => error);
// }
//
const getLoginUser = loginUserName => {
  return db.oneOrNone(
    `SELECT * FROM member
    WHERE username = '${loginUserName}'`
  )
  .catch(error => error);
}

// const getContacts = function(){
//   return db.query(`
//     SELECT
//       *
//     FROM
//       contact
//     `, [])
//     .catch(error => error);
// }
//
// const getContact = function(contactId){
//   return db.one(`
//     SELECT * FROM contact WHERE id=$1::int LIMIT 1
//     `,
//     [contactId])
//     .catch(error => error);
// }
//
// const deleteContact = function(contactId){
//   return db.query(`
//     DELETE FROM
//       contact
//     WHERE
//       id=$1::int
//     `,
//     [contactId])
//     .catch(error => error);
// }
//
// const searchForContact = function(searchQuery){
//   return db.query(`
//     SELECT
//       *
//     FROM
//       contact
//     WHERE
//       lower(first_name || ' ' || last_name) LIKE $1::text
//     `,
//     [`%${searchQuery.toLowerCase().replace(/\s+/,'%')}%`])
//     .catch(error => error);
// }
//
module.exports = {
  checkUser,
  createUser,
  getLoginUser
}
