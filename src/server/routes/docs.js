const db = require('../../db/db');
const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const {getRole/* , renderError, renderMessage */} = require('../util');

router.get('/', (request, response) => {
  const user = request.session.user;
  const addclass = user ? 'link' : 'gone';
  response.render('docs', {user, addclass});
});

const dirData = dirPath => {
  const names = fs.readdirSync(dirPath);
  // Return an array of data on non-hidden items, ordered by name.
  return names
    .filter(name => name[0] !== '.')
    .sort()
    .map(name => {
      const stats = fs.lstatSync(path.join(dirPath, name));
      const type
        = stats.isSymbolicLink() ? 'l' : (stats.isDirectory() ? 'd' : 'f');
      return {
        name,
        type,
        size: stats.size,
        modDate: [
          stats.mtime.getUTCFullYear(),
          stats.mtime.getUTCMonth(),
          stats.mtime.getUTCDate()
        ]
      };
    });
};

router.get('/browse', (request, response) => {
  const user = request.session.user;
  const topDirs =
  response.render('docs/browse', {user, dirData});
});

router.get('/add', (request, response) => {
  const user = request.session.user;
  if (getRole(user) > -1) {
    response.render('docs/add', {user});
  }
  else {
    response.redirect('/');
  }
});

module.exports = router;
