var game = require('../lib/game');
var user = require('../lib/user');

module.exports = function(app, db, isLoggedIn, hasJob, hasNoJob) {
  app.get('/', function(req, res) {
    if (req.session.email) {
      res.redirect('/dashboard');
    } else {
      res.render('index', {
        pageType: 'landing'
      });
    }
  });

  app.get('/dashboard', isLoggedIn, function(req, res) {
    game.preload(req, db, function(err, user) {
      req.session = user;
      res.render('game_dashboard', {
        pageType: 'dashboard',
        level: user.level,
        title: 'Dashboard'
      });
    });
  });

  app.get('/job', isLoggedIn, function(req, res) {
    res.render('job', {
      pageType: 'job',
      title: 'Choose a job!'
    });
  });

  app.post('/job', isLoggedIn, function(req, res) {
    user.getStats(req, db, function(err, userStat) {
      req.session = userStat;
      req.session.job = req.body.job;

      user.saveStats(req, db, function(err, user) {
        res.redirect('/dashboard');
      });
    });
  });

  app.get('/preview/:level', isLoggedIn, hasJob, function(req, res) {
    game.preload(req, db, function(err, user) {
      var config = require('../config/level' + user.level);

      res.render('game_preview', {
        pageType: 'game level' + user.level,
        level: user.level,
        title: config.location
      });
    });
  });

  app.get('/detail/:level', isLoggedIn, hasJob, function(req, res) {
    try {
      var level = parseInt(req.params.level.split('level')[1], 10);
      var config = require('../config/level' + level);

      if (req.session.level < level) {
        res.redirect('/dashboard');
      } else {
        res.render('game_detail', {
          pageType: 'game detail level' + level,
          level: level,
          title: 'The world of ' + config.location
        });
      }
    } catch(err) {
      // invalid level - just go back to their dashboard
      res.redirect('/dashboard');
    }
  });
};
