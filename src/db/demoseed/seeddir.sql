-- After editing this file (if you don’t also edit seedcat.sql), execute
-- the script seeddir_db.

TRUNCATE permit, act;

INSERT INTO act(id, name) VALUES
  (0, 'see'),
  (1, 'add'),
  (2, 'del');

INSERT INTO permit(cat, act, dir) VALUES
  (0, 0, 'demodocs'),
  (0, 1, 'demodocs'),
  (0, 2, 'demodocs'),
  (1, 0, 'demodocs/public'),
  (2, 0, 'demodocs/public'),
  (2, 0, 'demodocs/semipublic'),
  (3, 0, 'demodocs'),
  (3, 1, 'demodocs'),
  (4, 0, 'demodocs');
