'use strict';

var express = require('express');
var app = express.createServer();
var assert = require('should');
var user = require('../lib/user');
var nock = require('nock');
var should = require('should');
var nconf = require('nconf');
var redis = require('redis');
var db = redis.createClient();
var game = require('../lib/game');

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
    tools: undefined,
    hp: 50
  },
  body: {
    enemy: 'Starky'
  }
};

var enemy = {
  name: 'Starky',
  hp: 10,
  damage_low_range: 1,
  damage_high_range: 10,
  gold_low_range: 2,
  gold_high_range: 5
};

describe('game', function() {
  describe('battle', function() {
    it('battles an enemy and both HPs are less', function(done) {
      game.battle(req, enemy, db, function(err, result) {
        should.exist(result);
        result.playerHP.should.not.equal(50);
        result.enemyHP.should.not.equal(10);
        done();
      });
    });

    it('battles an enemy and player wins', function(done) {
      enemy.hp = 0;
      game.battle(req, enemy, db, function(err, result) {
        should.exist(result);
        result.gold.should.not.equal(0);
        result.enemyHP.should.equal(0);
        done();
      });
    });

    it('battles an enemy with a negation and player wins', function(done) {
      enemy.hp = -10;
      game.battle(req, enemy, db, function(err, result) {
        should.exist(result);
        result.gold.should.not.equal(0);
        result.enemyHP.should.equal(0);
        done();
      });
    });

    it('battles an enemy and player loses', function(done) {
      req.session.hp = 0;
      game.battle(req, enemy, db, function(err, result) {
        should.exist(result);
        result.gold.should.equal(0);
        result.playerHP.should.equal(0);
        done();
      });
    });
  });
});
