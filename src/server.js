require('dotenv').config();
const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const morgan = require('morgan');
const app = express();
const home_route = require('./server/routes/home');
const user_route = require('./server/routes/users');
const contact_route = require('./server/routes/contacts');

app.set('view engine', 'ejs');
app.set(
  'views',
  ['contacts', 'home', 'users', 'utils'].map(
    value => __dirname + '/views/' + value
  )
);

app.use(morgan('tiny'));
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use((request, response, next) => {
  response.locals.query = '';
  next();
});

app.use(session({
  name: 'docsearch',
  resave: true,
  saveUninitialized: true,
  secret: process.env.SECRET || 'cookiesecret',
  cookie: {maxAge: 30 * 24 * 60 * 60 * 1000},
  store: new FileStore()
}));

// app.use(processSession);

app.use('/', home_route);
app.use('/users', user_route);
app.use('/contacts', contact_route);

app.use((request, response) => {
  response.render('not_found');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});
