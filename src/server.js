/*
  Import confidential environment variables, overriding any conflicting
  existing ones.
*/
const fs = require('fs');
const dotenv = require('dotenv');
Object.assign(process.env, dotenv.parse(fs.readFileSync('.env')));

// Import required modules.
const DbUsr = require('./db/usr');
const express = require('express');
const proto = require(process.env.PROTOCOL);
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
const util = require('./server/util');
const msgs = require(`./server/${process.env.MSGS}`)[process.env.LANG];

// app.get('/favicon.ico', (request, response) => response.status(204));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Serve static files (i.e. style.css).
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// Log which IP addresses made which requests.
const accessLogStream = fs.createWriteStream(
  path.join(process.cwd(), 'logs/access.log'), {flags: 'a'}
);
/*
  This follows express.static, so static assets (e.g., style.css) are not
  logged.
*/
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
  /*
    Copy the messages object so changes may be made that don’t persist
    across request-response cycles via the Node require cache. Otherwise,
    personalized messages can be inherited by subsequent requests using
    the same browser, e.g., giving users other users’ data.
  */
  response.locals.msgs = Object.assign({}, msgs);
  response.locals.linkButton = util.linkButton;
  response.locals.linkButtonP = util.linkButtonP;
  if (request.session && request.session.usrID) {
    DbUsr.getUsr({type: 'id', id: request.session.usrID})
    .then(deepUsr => {
      // If user has a session and also a database record:
      if (deepUsr[0].id) {
        response.locals.usr = deepUsr;
        response.locals.msgs.status
          = util.personalStatusMsg(deepUsr[0], response.locals);
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
let server;
if (process.env.PROTOCOL === 'https') {
  server = proto.createServer(
    {
      handshakeTimeout: 30,
      cert: fs.readFileSync(process.env.HTTPS_CERT),
      key: fs.readFileSync(process.env.HTTPS_KEY)
    },
    app
  );
}
else {
  server = proto.createServer(app);
}
server.listen(port);
console.log(process.env.URL);
