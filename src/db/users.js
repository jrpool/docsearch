const db = require('./db');

const checkUser = user => {
  return db.oneOrNone(
    `SELECT * FROM member WHERE username = '${user.username}'`
  )
  .catch(error => error);
};

const createUser = user => {
  return db.oneOrNone(`
    INSERT INTO
      member (username, hashed_password, admin)
    VALUES
      ($1::text, $2::text, $3::boolean)
    RETURNING
      *
    `,
    [
      user.username,
      user.password1,
      user.admin
    ])
  .catch(error => error);
};

const getLoginUser = loginUserName => {
  return db.oneOrNone(
    `SELECT * FROM member
    WHERE username = '${loginUserName}'`
  )
  .catch(error => error);
};

// const updateSessionId = sessionID => {
//   return db.
// }
module.exports = {
  checkUser,
  createUser,
  getLoginUser
};
