'use strict';

var game = require('../lib/game');
var user = require('../lib/user');
var config = require('../config/defaults');

module.exports = function(app, db, isLoggedIn, hasJob, hasNoJob, sufficientLevelAccess, hasEnemy, resetEnemy) {
  app.get('/', function(req, res) {
    if (req.session.email) {
      res.redirect('/dashboard');
    } else {
      res.render('index', {
        pageType: 'landing'
      });
    }
  });

  app.get('/dashboard', isLoggedIn, resetEnemy, function(req, res) {
    res.render('game_dashboard', {
      pageType: 'dashboard',
      level: user.level,
      title: 'Dashboard'
    });
  });

  app.get('/universe', isLoggedIn, resetEnemy, function(req, res) {
    res.render('universe', {
      pageType: 'universe',
      level: user.level,
      title: 'Noodle Universe'
    });
  });

  // This is temporary until we actually have store functionality
  app.get('/refuel', isLoggedIn, resetEnemy, function(req, res) {
    if (req.session.gold >= 10) {
      var data = { result: {} };
      req.session.hp += 15;
      req.session.gold -= 10;

      user.saveStats(req, db, function(err, user) {
        if (err) {
          data.result.status = 500;
        } else {
          data.result = {
            hp: user.hp,
            gold: user.gold,
            status: 200
          }
        }

        res.json(data);
      });
    }
  });

  app.get('/job', isLoggedIn, hasNoJob, resetEnemy, function(req, res) {
    res.render('job', {
      pageType: 'job',
      title: 'Choose a job!'
    });
  });

  app.post('/job', isLoggedIn, hasNoJob, resetEnemy, function(req, res) {
    user.setJob(req.body.job, db, function(err, job) {
      req.session.job = job;

      user.saveStats(req, db, function(err, user) {
        res.redirect('/dashboard');
      });
    });
  });

  app.get('/preview/:level', isLoggedIn, hasJob, sufficientLevelAccess, resetEnemy, function(req, res) {
    var level = parseInt(req.params.level, 10);
    var config = require('../config/level' + level);

    res.render('game_preview', {
      pageType: 'game level' + level,
      level: level,
      title: config.location
    });
  });

  app.get('/detail/:level', isLoggedIn, hasJob, sufficientLevelAccess, function(req, res) {
    var level = parseInt(req.params.level, 10);
    var config = require('../config/level' + level);
    var enemy = config.enemies[Math.floor(Math.random() * config.enemies.length)];

    req.session.enemy = enemy;

    res.render('game_detail', {
      pageType: 'game detail level' + level,
      level: level,
      title: 'The world of ' + config.location,
      enemy: enemy,
      message: enemy.battle_messages[Math.floor(Math.random() * enemy.battle_messages.length)].message
    });
  });

  app.post('/battle', isLoggedIn, hasJob, sufficientLevelAccess, hasEnemy, function(req, res) {
    var level = parseInt(req.body.level, 10);
    var config = require('../config/level' + level);
    var result = {};
    
    game.battle(req, req.session.enemy, db, function(err, result) {
      res.json({
        result: result
      });
    });
  });
};
