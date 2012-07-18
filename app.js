'use strict';

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
};

var sufficientLevelAccess = function(req, res, next) {
  var level = parseInt(req.params.level || req.body.level, 10);

  if (!isNaN(level) && req.session.level <= level) {
    next();
  } else {
    res.redirect('/dashboard');
  }
};

var hasEnemy = function(req, res, next) {
  if (req.session.enemy) {
    next();
  } else {
    res.redirect('/dashboard');
  }
};

var resetEnemy = function(req, res, next) {
  if (req.session.enemy) {
    req.session.enemy = null;
  }
  next();
};

// routes
require("./routes")(app, db, isLoggedIn, hasJob, hasNoJob, sufficientLevelAccess, hasEnemy, resetEnemy);
require('./routes/auth')(app, db, nconf, isLoggedIn);

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
