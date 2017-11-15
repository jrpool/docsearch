DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  pwdhash VARCHAR(255) NOT NULL,
  name VARCHAR(40) NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  role SMALLINT NOT NULL,
  unit VARCHAR(3),
  title VARCHAR(30)
);

COMMENT ON TABLE user IS 'registered users';
COMMENT ON COLUMN user.id IS 'ID (unit if member, resident, or prospect)';
COMMENT ON COLUMN user.pwdhash IS 'hash of password';
COMMENT ON COLUMN user.name IS 'Full name';
COMMENT ON COLUMN user.email IS 'Email address, lower-cased';
COMMENT ON COLUMN user.role IS '0=member, 1=resident, 2=mgr, 3=prospect';
COMMENT ON COLUMN user.unit IS 'unit (if member, resident, or prospect)'
