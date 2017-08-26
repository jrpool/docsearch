DROP TABLE IF EXISTS contact, member;

CREATE TABLE contact (
  id serial primary key,
  first_name varchar(255) NOT NULL,
  last_name varchar(255) NOT NULL
);
CREATE TABLE member (
  id serial primary key,
  username varchar(255) NOT NULL UNIQUE,
  hashed_password varchar(255) NOT NULL,
  admin boolean default false not null
);
