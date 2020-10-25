const path = require('path');
const createError = require('http-errors');

const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const redis = require('redis');
const session = require('express-session');
const sassMiddleware = require('node-sass-middleware');

const RedisStore = require('connect-redis')(session);

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const { secret, origin, redisURI } = require('./config');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors({
  origin,
}));

const redisClient = redis.createClient(redisURI);

app.use(session({
  secret,
  name: 'chatbot',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
  store: new RedisStore({ client: redisClient }),
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false,
  sourceMap: true,
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
