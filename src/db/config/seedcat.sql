-- After editing this file:
-- 1. Edit seeddir.sql to be compatible with any changes in category IDs.
-- 2. Execute the script seedall_db.
-- 3. Edit all user registrations to assign users to categories.

TRUNCATE cat CASCADE;

INSERT INTO cat(id, name) VALUES
  (0, 'curator'),
  (1, 'public'),
  (2, 'member'),
  (3, 'resident'),
  (4, 'manager'),
  (5, 'prospect'),
  (6, 'director'),
  (7, 'treasurer');
