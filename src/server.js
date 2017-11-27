require('dotenv').config();
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

app.get('/favicon.ico', (request, response) => response.status(204));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(morgan('tiny'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

const store = new FileStore({retries: 0});

app.use(session({
  name: 'docsearch',
  resave: true,
  saveUninitialized: true,
  unset: 'destroy',
  secret: process.env.SECRET || 'cookiesecret',
  cookie: {maxAge: 7 * 24 * 60 * 60 * 1000},
  store
}));

app.use((request, response, next) => {
  request.sessionStore = store;
  response.locals.query = '';
  response.locals.msgs = require('./server/util').eng;
  const usr = request.session.usr;
  const status = response.locals.msgs.status;
  response.locals.msgs.status
    = usr ? response.locals.msgs.status.replace('{1}', usr.name) : '';
  next();
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
