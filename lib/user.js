'use strict';

var config = require('../config/defaults');
var jobs = require('../config/jobs');
var tools = require('../config/tools');
var toolObj = {};
toolObj['fist'] = tools['fist'];

var verifyStatValue = function(statName, statItem) {
  statItem = parseInt(statItem, 10);

  if (isNaN(statItem) || statItem < 0) {
    statItem = config[statName];
  }

  return statItem;
};

var userInit = function(req) {
  var user = {
    email: req.session.email,
    job: req.session.job || {},
    gold: verifyStatValue('gold', req.session.gold),
    level: verifyStatValue('level', req.session.level),
    hp: verifyStatValue('hp', req.session.hp),
    tools: req.session.tools || toolObj,
    xp: verifyStatValue('xp', req.session.xp),
    mp: verifyStatValue('mp', req.session.mp)
  };

  return user;
};

/* Set user job
 * Requires: job name, db connection
 * Returns: job object
 */
exports.setJob = function(job, db, callback) {
  callback(null, jobs[job] || jobs['engineer']);
};

/* Set user tool
 * Requires: tool name, db connection
 * Returns: tool object
 */
exports.setTool = function(tool, db, callback) {
  toolObj[tool] = tools[tool];

  callback(null, toolObj || tools['fist']);
};

/* Set user info
 * Requires: web request, db connection
 * Returns: A hash of the user's current score settings
 */
exports.saveStats = function(req, db, callback) {
  var userKey = 'user:' + req.session.email;

  if (req.session.hp < 1) {
    req.session.hp = 0;
  }

  var user = userInit(req);

  for (var name in user) {
    if (typeof user[name] === 'object') {
      db.hset(userKey, name, JSON.stringify(user[name]), function(err, resp) { });
    } else {
      db.hset(userKey, name, user[name], function(err, resp) { });
    }
  }

  callback(null, user);
};

/* Get user info
 * Requires: email, db connection
 * Returns: A hash of the user's current score settings
 */
exports.getStats = function(email, db, callback) {
  var userKey = 'user:' + email;

  db.hgetall(userKey, function(err, userItems) {
    if (err) {
      callback(err);
    } else {
      if (!userItems) {
        // User hasn't been created
        var req = {
          session: {
            email: email
          }
        };

        userItems = userInit(req);
      } else {
        userItems.tools = JSON.parse(userItems.tools);
        userItems.job = JSON.parse(userItems.job);
      }

      callback(null, userItems);
    }
  });
};

/* Reset user stats
 * Requires: email, db connection
 * Returns: A hash of the user's current score settings
 */
exports.resetStats = function(req, db, callback) {
  var userKey = 'user:' + req.session.email;

  for (var name in req.session) {
    db.hdel(userKey, name, function(err, resp) { });
  }

  callback(null, true);
};
