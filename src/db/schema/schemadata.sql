TRUNCATE roles, roledirs;

INSERT INTO roles values
  (0, 'public', 'docs/public'),
  (1, 'member', 'docs/'),
  (2, 'resident'),
  (3, 'manager'),
  (4, 'prospect'),
  (5, 'director'),
  (6, 'treasurer');

INSERT INTO roledirs values
  (0, 'docs/public'),
  (1, 'docs/public'),
  (1, 'docs/bth'),
  (2, 'docs/public'),
  (2, 'docs/bth/social'),
  (3, 'docs/public'),
  (3, 'docs/bth/social'),
  (4, 'docs/public'),
  (5, 'docs/public'),
  (5, 'docs/bth'),
  (5, 'docs/board'),
  (6, 'docs/public'),
  (6, 'docs/bth/finance');
