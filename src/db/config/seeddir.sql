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
  (2, 0, 'docs/bth'),
  (3, 0, 'docs/public'),
  (3, 0, 'docs/bth/social'),
  (4, 0, 'docs/public'),
  (4, 0, 'docs/bth/social'),
  (5, 0, 'docs/public'),
  (6, 0, 'docs/public'),
  (6, 0, 'docs/bth'),
  (6, 0, 'docs/board'),
  (7, 0, 'docs/public'),
  (7, 0, 'docs/bth/finance');
