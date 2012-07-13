module.exports = function(app, isLoggedIn) {
  app.get('/', function(req, res) {
    res.render('index', {
      pageType: 'landing'
    });
  });

  app.get('/dashboard', isLoggedIn, function(req, res) {
  	res.render('game_dashboard', {
      pageType: 'game'
    });
  });
};