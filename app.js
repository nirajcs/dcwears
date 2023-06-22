var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Handlebars=require('handlebars')
var hbs=require('express-handlebars')
var session=require('express-session')
var noCache = require('nocache')
// const connectMongoDBSession= require('connect-mongodb-session');



// const MongoDBStore = connectMongoDBSession(session);
// const mongoStore = new MongoDBStore({
//   uri: 'mongodb://0.0.0.0:27017/dcwears',
//   collection: 'sessions'
// });

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');

var app = express();

//mongoose connection
const mongoose=require('mongoose')
mongoose.connect('mongodb+srv://nirajcs2001:kNCtHDRcVfxAUCqi@cluster0.eumb15n.mongodb.net/?retryWrites=true&w=majority')

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs.engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layouts',partialsDir:__dirname+'/views/partials/'}))

app.use(noCache())
app.use(logger('dev'));
app.use(express.json()); 
app.use(express.urlencoded({ extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret:"TheKey",
  saveUninitialized:false,
  resave:false,
  cookie:{secure:false}
}))

Handlebars.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});

Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

Handlebars.registerHelper('formatDate',(date)=>{
  var options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString(undefined, options);
})


// Assuming you have an instance of Handlebars called 'handlebars'
Handlebars.registerHelper('formatDescription', function(description) {
  // Convert newline and carriage return characters into line breaks
  const formattedDescription = description.replace(/\r?\n/g, '<br>');
  return new Handlebars.SafeString(formattedDescription);
});


app.use('/admin', adminRouter);
app.use('/', usersRouter);

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
