DROP TABLE IF EXISTS usrcat, permit, cat, usr, act;

CREATE TABLE cat (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(15) NOT NULL UNIQUE
);

CREATE TABLE act (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(3) NOT NULL UNIQUE
);

CREATE TABLE permit (
  cat SMALLINT NOT NULL REFERENCES cat(id) ON DELETE CASCADE,
  act SMALLINT NOT NULL REFERENCES act(id) ON DELETE CASCADE,
  dir TEXT NOT NULL,
  UNIQUE(cat, act, dir)
);

CREATE TABLE usr (
  id SERIAL PRIMARY KEY,
  uid VARCHAR(15) UNIQUE,
  pwhash VARCHAR(60) NOT NULL,
  name VARCHAR(40) NOT NULL,
  email VARCHAR(50) NOT NULL,
  claims VARCHAR(264),
  UNIQUE(name, email)
);

CREATE TABLE usrcat (
  usr INTEGER NOT NULL REFERENCES usr(id) ON DELETE CASCADE,
  cat SMALLINT NOT NULL REFERENCES cat(id) ON DELETE CASCADE,
  UNIQUE(usr, cat)
);

COMMENT ON TABLE act IS 'actions performable on files in directories';
COMMENT ON COLUMN act.id IS 'ID';
COMMENT ON COLUMN act.name IS 'name';
COMMENT ON TABLE cat IS 'categories users can belong to';
COMMENT ON COLUMN cat.id IS 'ID';
COMMENT ON COLUMN cat.name IS 'name';
COMMENT ON TABLE permit IS 'permissions of categories on directories';
COMMENT ON COLUMN permit.cat IS 'category';
COMMENT ON COLUMN permit.dir IS 'directory relative to document root';
COMMENT ON COLUMN permit.act IS 'action';
COMMENT ON TABLE usr IS 'registered users';
COMMENT ON COLUMN usr.id IS 'serial ID';
COMMENT ON COLUMN usr.uid IS 'mnemonic ID';
COMMENT ON COLUMN usr.pwhash IS 'hash of password';
COMMENT ON COLUMN usr.name IS 'Full name';
COMMENT ON COLUMN usr.email IS 'Email address, lower-cased';
COMMENT ON COLUMN usr.claims IS 'asserted unit, title, etc.';
COMMENT ON TABLE usrcat IS 'users and categories they belong to';
COMMENT ON COLUMN usrcat.usr IS 'user';
COMMENT ON COLUMN usrcat.cat IS 'category';
