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
  Define a function that returns an array of objects describing the items
  in a directory, with properties 'name', 'type' ('f' or 'd'), 'size' (in
  bytes), and modDate' (empty string unless type is 'f').
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

/*
  Define a function that returns whether the objects in a directory include
  at least 1 nondirectory file.
*/
const anyFileIn = data => data.some(item => item.type === 'f');

// Page where user browses a permitted directory or all of them.
router.get('/browse', (request, response) => {
  // Identify an array of this user’s categories.
  const cats = response.locals.usr[1].length
    ? response.locals.usr[1]
    : [Number.parseInt(process.env.PUBLIC_CAT)];
  /*
    Identify an array of [category, act, directory] arrays describing all
    permissions.
  */
  DbDocs.catDirRights()
  .then(rights => {
    /*
      Limit it to subtree-top directories that this user is permitted to see,
      convert it to an array of those directories, sorted and pruned of
      duplicates.
    */
    let seeableDirs = rights
    .filter(right => cats.includes(right[0]) && right[1] === 0)
    .map(right => right[2])
    .sort()
    .reverse();
    // Store them in a table for efficient search.
    const dirMap = {};
    seeableDirs.forEach(dir => dirMap[dir] = 1);
    seeableDirs = seeableDirs.filter(dir => {
      const dirParts = dir.split('/');
      for (let i = dirParts.length - 1; i > 0; i--) {
        if (dirMap[dirParts.slice(0, i).join('/')]) {
          return false;
        }
      }
      return true;
    });
    const reqPath = request.query.p;
    // If the request specifies a path:
    if (reqPath) {
      // If user is permitted to see it:
      if (seeableDirs.some(dir => reqPath.startsWith(dir))) {
        const staticPath = path.join(process.cwd(), 'public');
        /*
          If it is a directory, display links to the items in it and, if
          they include any nondirectory file, a search control.
        */
        if (itemType(staticPath, reqPath) === 'd') {
          const data = dirData(staticPath, reqPath);
          response.render('docs/browse', {
            base: reqPath,
            delim: '/',
            dirData: data,
            head: response.locals.msgs.itemsIn.replace('{1}', reqPath),
            ifPermitSearch: anyFileIn(data)
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
    /*
      Otherwise, i.e. if the request does not specify a path, display the
      links to the directories the user is permitted to see.
    */
    else {
      response.render('docs/browse', {
        base: '',
        delim: '',
        dirData: seeableDirs.map(
          dir => ({name: dir, type: 'd', size: '', modDate: ''})
        ),
        head: '',
        ifPermitSearch: false
      });
    }
    return '';
  })
  .catch(error => {
    util.renderError(error, request, response);
  });
});

// Define a function that returns whether a string appears in a file.
const foundIn = (text, path) => {
  if (text.length && path.length) {
    return false;
  }
  else {
    return true;
  }
};

/*
  Page where user browses a permitted directory and, if it contains any
  nondirectory files, the results of a search on them.
*/
router.get('/search', (request, response) => {
  // Identify an array of this user’s categories.
  const cats = response.locals.usr[1].length
    ? response.locals.usr[1]
    : [Number.parseInt(process.env.PUBLIC_CAT)];
  /*
    Identify an array of [category, act, directory] arrays describing all
    permissions.
  */
  DbDocs.catDirRights()
  .then(rights => {
    /*
      Limit it to subtree-top directories that this user is permitted to see,
      convert it to an array of those directories, sorted and pruned of
      duplicates.
    */
    let seeableDirs = rights
    .filter(right => cats.includes(right[0]) && right[1] === 0)
    .map(right => right[2])
    .sort()
    .reverse();
    // Store them in a table for efficient search.
    const dirMap = {};
    seeableDirs.forEach(dir => dirMap[dir] = 1);
    seeableDirs = seeableDirs.filter(dir => {
      const dirParts = dir.split('/');
      for (let i = dirParts.length - 1; i > 0; i--) {
        if (dirMap[dirParts.slice(0, i).join('/')]) {
          return false;
        }
      }
      return true;
    });
    // Identify the directory for the search.
    const reqPath = request.query.p;
    // If the user is permitted to see it:
    if (seeableDirs.some(dir => reqPath.startsWith(dir))) {
      const staticPath = path.join(process.cwd(), 'public');
      /*
        Add to the object describing each of its nondirectory items a property
        identifying whether the searched text appears in it.
      */
      const searchText = request.query.q;
      const data = dirData(staticPath, reqPath);
      data.forEach((item, index) => {
        if (searchText) {
          if (item.type === 'f') {
            data[index].found = foundIn(searchText, item.name);
          }
          else {
            data[index].found = '';
          }
        }
        else {
          data[index].found = '';
        }
      });
      /*
        Display links to the items in it and a search control.
      */
      if (itemType(staticPath, reqPath) === 'd') {
        response.render('docs/search', {
          base: reqPath,
          delim: '/',
          dirData: data,
          head: response.locals.msgs.itemsIn.replace('{1}', reqPath),
          permitSearch: true,
          searchText
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
    return '';
  })
  .catch(error => {
    util.renderError(error, request, response);
  });
});

// Page where user adds documents to the repository.
router.get('/add', (request, response) => {
  response.render('docs/add');
});

module.exports = router;
