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

const killSession = sessionID => {
  return db.none(`
    DELETE FROM session WHERE sid = '${sessionID}';
  `)
  .catch(error => error);
};

const recordSession = (sessionID, memberID) => {
  return db.none(`
    DELETE FROM session WHERE sid = '${sessionID}' or member = ${memberID};
    INSERT INTO session (sid, member, last_visit)
      VALUES (sessionID, memberID, CURRENT_DATE);
  `)
  .catch(error => error);
};

const sessionUser = sessionID => {
  return db.oneOrNone(`
    DELETE FROM session WHERE CURRENT_DATE - 30 > last_visit;
    SELECT member.id, member.username, member.admin FROM session, member
      WHERE session.sid = '${sessionID}'
      AND member.id = session.member;
  `)
  .catch(error => error);
};

module.exports = {
  checkUser,
  createUser,
  getLoginUser,
  killSession,
  recordSession,
  sessionUser
};
