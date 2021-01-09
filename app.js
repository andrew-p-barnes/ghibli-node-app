var createError = require('http-errors');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var Login = require("./models/login");

//passport config:
require('./config/passport')(passport)

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//Set up mongoose connection
let connectionStr = 'mongodb+srv://' + Login.User + ':' + Login.Password + '@cluster0.9xazx.mongodb.net/ghibli?retryWrites=true&w=majority';
mongoose.connect(connectionStr, {
  useNewUrlParser: true
})
.then(() => console.log('connected to db'))
.catch((err)=> console.log(err));


const app = express();

const port = 3000

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// view engine setup
app.engine('ejs', require('express-ejs-extend'));
app.set('view engine', 'ejs');
// app.use(expressEjsLayout);
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//express session
app.use(session({
  secret : 'secret',
  resave : true,
  saveUninitialized : true
 }));

app.use(passport.initialize());
app.use(passport.session());

//use flash
app.use(flash());
app.use((req,res,next)=> {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error  = req.flash('error');
next();
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json({ extended: true }));
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
