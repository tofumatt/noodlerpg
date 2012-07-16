'use strict';

var config = require('../config/defaults');

/* Set user info
 * Requires: web request, db connection
 * Returns: A hash of the user's current score settings
 */
exports.saveStats = function(req, db, callback) {
  var userKey = 'user:' + req.session.email;

  db.hset(userKey, 'job', req.session.job);
  db.hset(userKey, 'gold', req.session.gold);
  db.hset(userKey, 'level', req.session.level);
  db.hset(userKey, 'hp', req.session.hp);

  var user = {
    email: req.session.email,
    job: req.session.job,
    gold: parseInt(req.session.gold, 10),
    level: parseInt(req.session.level, 10),
    hp: parseInt(req.session.hp, 10)
  };

  callback(null, user);
};

/* Get user info
 * Requires: web request, db connection
 * Returns: A hash of the user's current score settings
 */
exports.getStats = function(req, db, callback) {
  var userKey = 'user:' + req.session.email;

  db.hgetall(userKey, function(err, userItems) {
    if (err) {
      callback(err);
    } else {
      if (userItems) {
        userItems.email = req.session.email;
      } else {
        // User hasn't been created
        userItems = {
          email: req.session.email,
          job: undefined,
          gold: config.gold,
          level: 1,
          hp: config.hp
        };
      }

      callback(null, userItems);
    }
  });
};
