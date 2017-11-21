INSERT INTO grp values
  (0, 'public'),
  (1, 'member'),
  (2, 'resident'),
  (3, 'manager'),
  (4, 'prospect'),
  (5, 'director'),
  (6, 'treasurer'),
  (7, 'curator');

INSERT INTO act values
  (0, 'see'),
  (1, 'add'),
  (2, 'del');

INSERT INTO permit values
  (0, 'docs/public', 0),
  (1, 'docs/public', 0),
  (1, 'docs/bth', 0),
  (2, 'docs/public', 0),
  (2, 'docs/bth/social', 0),
  (3, 'docs/public', 0),
  (3, 'docs/bth/social', 0),
  (4, 'docs/public', 0),
  (5, 'docs/public', 0),
  (5, 'docs/bth', 0),
  (5, 'docs/board', 0),
  (6, 'docs/public', 0),
  (6, 'docs/bth/finance', 0),
  (7, 'docs', 0),
  (7, 'docs', 1),
  (7, 'docs', 2);
