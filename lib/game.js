'use strict';

var user = require('./user');

/* Game loader
 * Requires: web request, db connection
 * Returns: The last level the user was playing at or defaults to the first level
 */
exports.preload = function(req, db, callback) {
  user.getStats(req, db, function(err, user) {
    if (err) {
      callback(err);
    } else {
      callback(null, user);
    }
  });
};

