DROP TABLE IF EXISTS users;

CREATE TABLE roles (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(15) NOT NULL
);

CREATE TABLE roledirs (
  role SMALLINT NOT NULL REFERENCES roles(id),
  dir TEXT NOT NULL,
  UNIQUE(role, dir)
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  pwdhash VARCHAR(255) NOT NULL,
  uname VARCHAR(63) NOT NULL UNIQUE,
  email VARCHAR(63) NOT NULL UNIQUE,
  facts VARCHAR(127)
);

CREATE TABLE userroles (
  user INTEGER NOT NULL REFERENCES users(id),
  role SMALLINT NOT NULL REFERENCES roles(id),
  UNIQUE(user, role)
);

COMMENT ON TABLE roles IS 'roles';
COMMENT ON COLUMN roles.id IS 'ID';
COMMENT ON COLUMN roles.name IS 'name';
COMMENT ON TABLE roledirs IS 'directories accessible to roles';
COMMENT ON COLUMN roledirs.role IS 'role';
COMMENT ON COLUMN roledirs.dir IS 'directory relative to document root';
COMMENT ON TABLE users IS 'registered users';
COMMENT ON COLUMN users.id IS 'ID';
COMMENT ON COLUMN users.pwdhash IS 'hash of password';
COMMENT ON COLUMN users.name IS 'Full name';
COMMENT ON COLUMN users.email IS 'Email address, lower-cased';
COMMENT ON COLUMN users.unit IS 'unit (if member, resident, or prospect)';
COMMENT ON COLUMN users.title  IS 'title (if manager)';
COMMENT ON TABLE userroles IS 'roles of users';
COMMENT ON COLUMN userroles.user IS 'user';
COMMENT ON COLUMN userroles.role IS 'role';
