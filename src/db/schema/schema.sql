DROP TABLE IF EXISTS contact, user;

CREATE TABLE contact (
  id serial,
  first_name varchar(255) NOT NULL,
  last_name varchar(255) NOT NULL
);
CREATE TABLE user (
  id serial,
  username varchar(255) NOT NULL,
  hashed_password varchar(255) NOT NULL
);
