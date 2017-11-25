INSERT INTO grp(id, name) values
  (0, 'curator'),
  (1, 'public'),
  (2, 'member'),
  (3, 'resident'),
  (4, 'manager'),
  (5, 'prospect'),
  (6, 'director'),
  (7, 'treasurer');

INSERT INTO act(id, name) values
  (0, 'see'),
  (1, 'add'),
  (2, 'del');

INSERT INTO permit(grp, dir, act) values
  (0, 'docs', 0),
  (0, 'docs', 1),
  (0, 'docs', 2),
  (1, 'docs/public', 0),
  (2, 'docs/public', 0),
  (2, 'docs/bth', 0),
  (3, 'docs/public', 0),
  (3, 'docs/bth/social', 0),
  (4, 'docs/public', 0),
  (4, 'docs/bth/social', 0),
  (5, 'docs/public', 0),
  (6, 'docs/public', 0),
  (6, 'docs/bth', 0),
  (6, 'docs/board', 0),
  (7, 'docs/public', 0),
  (7, 'docs/bth/finance', 0);
