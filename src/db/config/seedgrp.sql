-- After editing this file, execute the script seedall_db. Then edit all
-- user registrations to assign users to categories.

TRUNCATE grp CASCADE;

INSERT INTO grp(id, name) VALUES
  (0, 'curator'),
  (1, 'public'),
  (2, 'member'),
  (3, 'resident'),
  (4, 'manager'),
  (5, 'prospect'),
  (6, 'director'),
  (7, 'treasurer');
