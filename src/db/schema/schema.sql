DROP TABLE IF EXISTS contact, member, session;

CREATE TABLE contact (
  id serial,
  first_name varchar(255) NOT NULL,
  last_name varchar(255) NOT NULL
);
CREATE TABLE member (
  id serial,
  username varchar(255) NOT NULL UNIQUE,
  hashed_password varchar(255) NOT NULL,
  admin boolean default false not null
);
CREATE TABLE session (
  sid text primary key,
  sess json NOT NULL,
  expire timestamp(6) NOT NULL
);
