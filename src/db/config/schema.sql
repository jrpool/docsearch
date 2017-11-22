DROP TABLE IF EXISTS usrgrp, permit, grp, usr;

CREATE TABLE grp (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(15) NOT NULL UNIQUE
);

CREATE TABLE act (
  id SMALLINT PRIMARY KEY,
  name VARCHAR(3) NOT NULL UNIQUE
);

CREATE TABLE permit (
  grp SMALLINT NOT NULL REFERENCES grp(id),
  dir TEXT NOT NULL,
  act SMALLINT NOT NULL REFERENCES act(id),
  UNIQUE(grp, dir, act)
);

CREATE TABLE usr (
  id SERIAL PRIMARY KEY,
  pwhash VARCHAR(60) NOT NULL,
  name VARCHAR(40) NOT NULL,
  email VARCHAR(50) NOT NULL,
  facts VARCHAR(264),
  UNIQUE(name, email)
);

CREATE TABLE usrgrp (
  usr INTEGER NOT NULL REFERENCES usr(id),
  grp SMALLINT NOT NULL REFERENCES grp(id),
  UNIQUE(usr, grp)
);

COMMENT ON TABLE grp IS 'groups users can belong to';
COMMENT ON COLUMN grp.id IS 'ID';
COMMENT ON COLUMN grp.name IS 'name';
COMMENT ON TABLE act IS 'actions performable on files in directories';
COMMENT ON COLUMN act.id IS 'ID';
COMMENT ON COLUMN act.name IS 'name';
COMMENT ON TABLE permit IS 'permissions of groups on directories';
COMMENT ON COLUMN permit.grp IS 'group';
COMMENT ON COLUMN permit.dir IS 'directory relative to document root';
COMMENT ON COLUMN permit.act IS 'action';
COMMENT ON TABLE usr IS 'registered users';
COMMENT ON COLUMN usr.id IS 'serial ID';
COMMENT ON COLUMN usr.pwhash IS 'hash of password';
COMMENT ON COLUMN usr.name IS 'Full name';
COMMENT ON COLUMN usr.email IS 'Email address, lower-cased';
COMMENT ON COLUMN usr.facts IS 'unit, title, etc.';
COMMENT ON TABLE usrgrp IS 'users and groups they belong to';
COMMENT ON COLUMN usrgrp.usr IS 'user';
COMMENT ON COLUMN usrgrp.grp IS 'group';
