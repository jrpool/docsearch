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
    {
      usr,
      ifCanAdd: usr && response.locals.usr[1].includes(
        Number.parseInt(process.env.CURATOR_CAT)
      ) ? '' : 'class="gone" '
    }
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
  const cats = response.locals.usr[1].length
    ? response.locals.usr[1]
    : [Number.parseInt(process.env.PUBLIC_CAT)];
  DbDocs.catDirRights()
  .then(rights => {
    /*
      Identify directories the user is permitted to see, sorted, pruned
      of duplicates and limited to subtree tops.
    */
    const rightMap = {};
    rights = rights
    .filter(right => cats.includes(right[0]) && right[1] === 0)
    .map(right => right[2])
    .sort()
    .reverse();
    rights.forEach(right => rightMap[right] = 1);
    rights = rights.filter(right => {
      const rightParts = right.split('/');
      for (let i = rightParts.length - 1; i > 0; i--) {
        if (rightMap[rightParts.slice(0, i).join('/')]) {
          return false;
        }
      }
      return true;
    });
    const reqPath = request.query.p;
    // If the request specifies a path:
    if (reqPath) {
      // If user is permitted to see it:
      if (rights.some(right => reqPath.startsWith(right))) {
        const staticPath = path.join(process.cwd(), 'public');
        // If it is a directory, display its contents.
        if (itemType(staticPath, reqPath) === 'd') {
          response.render('docs/browse', {
            base: reqPath,
            delim: '/',
            dirData: dirData(staticPath, reqPath),
            head: response.locals.msgs.itemsIn.replace('{1}', reqPath)
          });
        }
        // If it is a regular file, serve it.
        else {
          response.sendFile(reqPath, {root: staticPath});
        }
      }
      else {
        util.redirectHome(request, response);
      }
    }
    // If the request does not specify a path:
    else {
      response.render('docs/browse', {
        base: process.env.LINK_PREFIX,
        delim: '/',
        dirData: rights.map(
          right => ({name: right, type: 'd', size: '', modDate: ''})
        ),
        head: ''
      });
    }
    return '';
  })
  .catch(error => {
    util.renderError(error, request, response);
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
