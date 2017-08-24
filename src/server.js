require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const home_route = require('./server/routes/home');
const user_route = require('./server/routes/users');
const contact_route = require('./server/routes/contacts');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use((request, response, next) => {
  response.locals.query = '';
  next();
});

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
