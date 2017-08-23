\copy contact(first_name, last_name) FROM './test/seed/random_contacts.txt' DELIMITER ',' CSV HEADER;

INSERT INTO
  contact (first_name, last_name)
VALUES
  ('Jared', 'Grippe'),
  ('Tanner', 'Welsh'),
  ('NeEddra', 'James')
;
