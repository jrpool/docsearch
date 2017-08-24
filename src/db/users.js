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
};

const getLoginUser = loginUserName => {
  return db.oneOrNone(
    `SELECT * FROM member
    WHERE username = '${loginUserName}'`
  )
  .catch(error => error);
};

module.exports = {
  checkUser,
  createUser,
  getLoginUser
};
