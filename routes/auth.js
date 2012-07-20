var auth = require('../lib/authenticate');
var user = require('../lib/user');

module.exports = function(app, db, nconf, isLoggedIn) {
  // Login
  app.post('/login', function(req, res) {
    auth.verify(req, nconf, function(error, email) {
      if (email) {
        user.getStats(email, db, function(err, userStat) {
          req.session.email = email;
          req.session.level = userStat.level;
          req.session.hp = userStat.hp;
          req.session.tools = userStat.tools;
          req.session.job = userStat.job;
          req.session.gold = userStat.gold;
          req.session.xp = userStat.xp;
          req.session.mp = userStat.mp;

          res.redirect('/dashboard');
        });
      } else {
        res.redirect('/');
      }
    });
  });

  // Logout
  app.get('/logout', isLoggedIn, function(req, res) {
    req.session.reset();
    res.redirect('/', 303);
  });
};
