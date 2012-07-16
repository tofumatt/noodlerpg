var game = require('../lib/game');

module.exports = function(app, db, isLoggedIn) {
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
    game.preload(req, db, function(err, level) {
      res.render('game_dashboard', {
        pageType: 'dashboard',
        level: level,
        title: 'Dashboard'
      });
    });
  });

  app.get('/preview/:level', isLoggedIn, function(req, res) {
    game.preload(req, db, function(err, level) {
      var config = require('../config/' + level);

      res.render('game_preview', {
        pageType: 'game ' + level,
        level: level,
        title: config.location 
      });
    });
  });

  app.get('/detail/:level', isLoggedIn, function(req, res) {
    try {
      var level = parseInt(req.params.level.split('level')[1], 10);
      var config = require('../config/level' + level);

      if (req.session.level < level) {
        res.redirect('/dashboard');
      } else {
        res.render('game_detail', {
          pageType: 'game detail ' + level,
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
