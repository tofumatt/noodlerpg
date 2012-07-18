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
  }
});

var req = {
  session: {
    email: 'test@test.org',
    job: 'Engineer',
    level: 1,
    gold: 100,
    tools: ['fist'],
    hp: 50
  }
};

describe('user', function() {
  describe('saveStats', function() {
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
      user.saveStats(req, db, function(err, userStatSave) {
        user.getStats(req.session.email, db, function(err, userStat) {
          should.exist(userStat);
          userStat.email.should.equal(req.session.email);
          userStat.job.should.equal(req.session.job);
          userStat.level.should.equal(JSON.stringify(req.session.level));
          userStat.gold.should.equal(JSON.stringify(req.session.gold));
          done();
        });
      });
    });
  });
});
