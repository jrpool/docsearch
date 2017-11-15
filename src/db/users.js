const db = require('./db');

const getEmailUser = email => {
  return db.oneOrNone(
    `SELECT * FROM users WHERE email = '${email}'`
  )
  .catch(error => error);
};

const getUserUser = user => {
  return db.oneOrNone(
    `SELECT * FROM users WHERE email = '${user.email}'`
  )
  .catch(error => error);
};

const createUser = user => {
  return db.oneOrNone(`
    INSERT INTO
      users (pwdhash, name, email, role, unit, title)
    VALUES
      (
        $1::VARCHAR(255),
        $2::VARCHAR(40),
        $3::VARCHAR(50),
        $4::SMALLINT,
        $5::VARCHAR(3),
        $6::VARCHAR(30)
      )
    RETURNING
      *
    `,
    [
      user.pwdhash,
      user.name,
      user.email,
      user.role,
      user.unit,
      user.title
    ])
  .catch(error => error);
};

module.exports = {
  getEmailUser,
  getUserUser,
  createUser
};
