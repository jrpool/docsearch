-- After editing this file (if you don’t also edit seedcat.sql), execute
-- the script seeddir_db.

TRUNCATE permit, act;

INSERT INTO act(id, name) VALUES
  (0, 'see'),
  (1, 'add'),
  (2, 'del');

INSERT INTO permit(cat, act, dir) VALUES
  (0, 0, 'docs'),
  (0, 1, 'docs'),
  (0, 2, 'docs'),
  (1, 0, 'docs/public'),
  (2, 0, 'docs/public'),
  (2, 0, 'docs/semipublic'),
  (3, 0, 'docs'),
  (3, 1, 'docs'),
  (4, 0, 'docs');
