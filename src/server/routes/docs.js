// Import required modules.
const DbDocs = require('../../db/docs');
const path = require('path');
const router = require('express').Router();
const fs = require('fs');
const util = require('./util');

// Main doc page, including an “add” button only if user has any add permission.
router.get('/', (request, response) => {
  const usr = response.locals.usr;
  response.render(
    'docs',
    {usr, ifCanAdd: usr && response.locals.usr[1].includes(1) ? '' : 'gone '}
  );
});

// Define a function that returns the type of an item in the filesystem.
const itemType = (staticPath, reqPath) => {
  const stats = fs.statSync(path.join(staticPath, reqPath));
  if (stats) {
    return stats.isDirectory() ? 'd' : 'f';
  }
  else {
    return '';
  }
};

/*
  Define a function that returns an array of fact objects describing the
  items in a directory.
*/
const dirData = (staticPath, reqPath) => {
  const names = fs.readdirSync(path.join(staticPath, reqPath));
  // Return an array of data on non-hidden items, ordered by name.
  if (names) {
    return names
    .filter(name => name[0] !== '.')
    .sort()
    .map(name => {
      const stats = fs.statSync(path.join(staticPath, reqPath, name));
      const type = stats.isDirectory() ? 'd' : 'f';
      return {
        name,
        type,
        size: type === 'f' ? stats.size : '',
        modDate: type === 'f' ? stats.mtime.toISOString().slice(0, 10) : ''
      };
    });
  }
  else {
    return '';
  }
};

// Page where user browses permitted directories.
router.get('/browse', (request, response) => {
  const usr = response.locals.usr || [{id: 0}, []];
  DbDocs.usrDirRights(usr[0].id)
  .then(rights => {
    const reqPath = request.query.p;
    // If the request specifies a path:
    if (reqPath) {
      if (
        rights.some(right => (right[0] === 0) && reqPath.startsWith(right[1]))
      ) {
        const staticPath = path.join(process.cwd(), 'public');
        if (itemType(staticPath, reqPath) === 'd') {
          const pathSegs = reqPath.split('/');
          response.render('docs/browse', {
            usr,
            up: pathSegs.slice(0, -1).join('/'),
            last: pathSegs.slice(-1),
            base: reqPath,
            delim: '/',
            dirData: dirData(staticPath, reqPath)
          });
        }
        else {
          response.sendFile(reqPath, {root: staticPath});
        }
      }
      else {
        response.redirect('/');
      }
    }
    // If the request does not specify a path or specifies “docs”.
    else {
      response.render('docs/browse', {
        usr,
        up: '',
        last: '',
        base: '',
        delim: '',
        dirData: rights.filter(right => right[0] === 0).map(
          right => ({name: right[1], type: 'd', size: '', modDate: ''})
        )
      });
    }
    return '';
  })
  .catch(error => {
    util.renderError(error, request, response);
    client.end();
  });
});

// Page where user searches permitted directories.
router.get('/search', (request, response) => {
  response.render('docs/search');
});

// Page where user adds documents to the repository.
router.get('/add', (request, response) => {
  response.render('docs/add');
});

module.exports = {router};
