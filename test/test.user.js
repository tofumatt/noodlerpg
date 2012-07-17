'use strict';

var express = require('express');
var app = express.createServer();
var assert = require('should');
var user = require('../lib/user');
var nock = require('nock');
var should = require('should');
var nconf = require('nconf');
var redis = require("redis");
var db = redis.createClient();

nconf.argv().env().file({ file: 'test/local-test.json' });

db.select(app.set('redisnoodle'), function(err, res) {
  if (err) {
    console.log('TEST database connection failed.');
  } else {
    console.log('TEST database connected...');
  }
});

var req = {
  session: {
    email: 'test@test.org',
    job: 'Engineer',
    level: 1,
    gold: 100,
    tools: undefined,
    hp: 50
  }
};

describe('user', function() {
  describe('POST /saveStats', function() {
    it('saves user stats', function(done) {
      user.saveStats(req, db, function(err, user) {
        should.exist(user);
        user.email.should.equal(req.session.email);
        user.job.should.equal(req.session.job);
        user.level.should.equal(req.session.level);
        user.gold.should.equal(req.session.gold);
        done();
      });
    });

    it('gets user stats', function(done) {
      user.getStats(req, db, function(err, user) {
        should.exist(user);
        user.email.should.equal(req.session.email);
        user.job.should.equal(req.session.job);
        user.level.should.equal(JSON.stringify(req.session.level));
        user.gold.should.equal(JSON.stringify(req.session.gold));
        done();
      });
    });
  });
});
