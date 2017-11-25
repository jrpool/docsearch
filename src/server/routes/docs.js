// Import required modules.
require('dotenv').config();
const path = require('path');
const router = require('express').Router();
const fs = require('fs');

// Create a connection to the “docsearch” database.
const {Client} = require('pg');
const client = new Client();

// const {renderError, renderMessage} = require('../util');

// Serve the main doc page
router.get('/', (request, response) => {
  const usr = request.session.usr;
  const addclass = usr ? 'link' : 'gone';
  response.render('docs', {usr, addclass});
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

const readableTopDirs = usrID => {
  return client.connect()
  .then(() => client.query({
    rowMode: 'array',
    values: usrID,
    text: usrID
      ?
      `SELECT permit.dir FROM usrgrp, permit
        WHERE usrgrp.usr = $1
        AND permit.grp = usrgrp.grp
        AND permit.act = 0`
      :
      'SELECT permit.dir FROM permit WHERE grp = 0 AND act = 0'
  }))
  .then(result => {
    client.end();
    return result.rows.map(row => row[0]);
  })
  .catch(error => {
    renderError(error, request, response);
    client.end();
  });
};

router.get('/browse', (request, response) => {
  const usr = request.session.usr || {id: 0};
  readableTopDirs(usr.id)
  .then(dirs => {
    const reqPath = request.query.p;
    if (reqPath) {
      if (dirs.some(dir => reqPath.startsWith(dir))) {
        const staticPath = path.join(path.resolve(), 'public');
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
    else {
      response.render('docs/browse', {
        usr, up: '', last: '', base: '', delim: '', dirData: dirs.map(
          dir => ({name: dir, type: 'd', size: '', modDate: ''})
        )
      });
    }
    return '';
  })
  .catch(error => {
    renderError(error, request, response);
    client.end();
  });
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

module.exports = {dirData, router};
