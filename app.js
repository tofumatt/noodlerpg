var express = require('express');
var configurations = module.exports;
var app = express.createServer();
var nconf = require('nconf');
var redis = require('redis');
var db = redis.createClient();
var settings = require('./settings')(app, configurations, express);

nconf.argv().env().file({ file: 'local.json' });

var isLoggedIn = function(req, res, next) {
  if (req.session.email) {
    next();
  } else {
    err.status = 403;
    next(new Error('not allowed!'));
  }
};

var hasJob = function(req, res, next) {
  if (req.session.job) {
    next();
  } else {
    res.redirect('/job');
  }
};

var hasNoJob = function(req, res, next) {
  if (!req.session.job) {
    next();
  } else {
    res.redirect('/dashboard');
  }
}

// routes
require("./routes")(app, db, isLoggedIn, hasJob, hasNoJob);
require('./routes/auth')(app, nconf, isLoggedIn);

app.get('/404', function(req, res, next){
  next();
});

app.get('/403', function(req, res, next){
  err.status = 403;
  next(new Error('not allowed!'));
});

app.get('/500', function(req, res, next){
  next(new Error('something went wrong!'));
});

app.listen(process.env.PORT || nconf.get('port'));
