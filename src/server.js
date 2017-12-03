// Define non-confidential environment variables.'
process.env.NODE_ENV = 'production';
process.env.PGHOST = 'localhost';
process.env.PGUSER = 'solr';
process.env.PGDATABASE = 'docsearch';
process.env.PGPORT = '5432';
process.env.PORT = '3000';
process.env.LANG = 'eng';
process.env.CURATOR_CAT = '0';
process.env.PUBLIC_CAT = '1';
process.env.FROM_EMAIL = 'noreply@yourdomain.org';
process.env.FROM_NAME = 'Documents from Your Organization';
process.env.COOKIE_EXPIRE_DAYS = '7';
process.env.TEMP_UID_MAX = '3';
process.env.REG_EMAIL = 'admin@yourdomain.org';
process.env.REG_NAME = 'Your Administrator';

/*
  Import confidential environment variables, overriding any conflicting
  existing ones, including those above.
*/
const fs = require('fs');
const dotenv = require('dotenv');
Object.assign(process.env, dotenv.parse(fs.readFileSync('.env')));

// Import required modules.
const DbUsr = require('./db/usr');
const express = require('express');
const app = express();
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const morgan = require('morgan');
const home_route = require('./server/routes/home');
const usr_route = require('./server/routes/usr');
const doc_route = require('./server/routes/docs').router;
const curate_route = require('./server/routes/curate');
const path = require('path');

app.get('/favicon.ico', (request, response) => response.status(204));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Serve static files (i.e. style.css).
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// Log which IP addresses made which requests.
const accessLogStream = fs.createWriteStream(
  path.join(process.cwd(), 'logs/access.log'), {flags: 'a'}
);
// Because this follows express.static, no static assets are logged.
app.use(morgan(
  ':date[iso] :status :method :remote-addr :url', {
    stream: accessLogStream,
  }
));

// Make session directory contain session records.
const store = new FileStore({retries: 0});
app.use(session({
  name: 'docsearch',
  resave: false,
  saveUninitialized: false,
  unset: 'destroy',
  secret: process.env.SECRET || 'cookiesecret',
  cookie: {maxAge: 24 * 60 * 60 * 1000 * process.env.COOKIE_EXPIRE_DAYS},
  store
}));

/*
  Make general resources available to routes and views during this
  request-response cycle.
*/
app.use((request, response, next) => {
  request.sessionStore = store;
  response.locals.query = '';
  response.locals.msgs = require('./server/util')[process.env.LANG];
  response.locals.linkButton = require('./server/util').linkButton;
  response.locals.linkButtonP = require('./server/util').linkButtonP;
  if (request.session && request.session.usrID) {
    DbUsr.getUsr({type: 'id', id: request.session.usrID})
    .then(deepUsr => {
      if (deepUsr[0].id) {
        response.locals.usr = deepUsr;
        response.locals.msgs.status =
          response.locals.msgs.status.replace('{1}', deepUsr[0].name)
            .replace(
              '{2}',
              response.locals.linkButton(
                '/usr/logout',
                response.locals.msgs.btnLogout,
                {tabIndex: 'tabindex="-1" '}
              )
            )
            .replace(
              '{3}',
              response.locals.linkButton(
                '/usr/deregister',
                response.locals.msgs.btnDeregister,
                {tabIndex: 'tabindex="-1" '}
              )
            );
      }
      else {
        response.locals.usr = [{}, []];
        response.locals.msgs.status = '';
      }
      next();
    })
    .catch(error => {
      throw error;
    });
  }
  else {
    response.locals.usr = [{}, []];
    response.locals.msgs.status = '';
    next();
  }
});

app.use('/', home_route);
app.use('/usr', usr_route);
app.use('/docs', doc_route);
app.use('/curate', curate_route);

app.use((request, response) => {
  response.render('util/not_found');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
