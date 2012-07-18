'use strict';

var config = require('../config/defaults');
var jobs = require('../config/jobs');
var tools = require('../config/tools');

/* Set user job
 * Requires: job name, db connection
 * Returns: job object
 */
exports.setJob = function(jobName, db, callback) {
  var job = {};

  for(var i = 0; i < jobs.length; i ++) {
    if (jobs[i].name.toLowerCase() === jobName.toLowerCase()) {
      job = jobs[i];
      break;
    }
  }

  callback(null, job);
};

/* Set user tool
 * Requires: tool name, db connection
 * Returns: tool object
 */
exports.setTool = function(tool, db, callback) {
  var currTool = {};

  for(var i = 0; i < tools.length; i ++) {
    if (tools[i].name.toLowerCase() === tool.toLowerCase()) {
      currTool = tools[i];
      break;
    }
  }

  callback(null, currTool);
};

/* Set user info
 * Requires: web request, db connection
 * Returns: A hash of the user's current score settings
 */
exports.saveStats = function(req, db, callback) {
  var userKey = 'user:' + req.session.email;
  
  db.hset(userKey, 'job', req.session.job || {});
  db.hset(userKey, 'gold', req.session.gold);
  db.hset(userKey, 'level', req.session.level);
  db.hset(userKey, 'hp', req.session.hp);
  db.hset(userKey, 'tools', req.session.tools || config.tools);

  var user = {
    email: req.session.email,
    job: req.session.job,
    gold: parseInt(req.session.gold, 10),
    level: parseInt(req.session.level, 10),
    hp: parseInt(req.session.hp, 10),
    tools: req.session.tools
  };


  callback(null, user);
};

/* Get user info
 * Requires: web request, db connection
 * Returns: A hash of the user's current score settings
 */
exports.getStats = function(email, db, callback) {
  var userKey = 'user:' + email;

  db.hgetall(userKey, function(err, userItems) {
    if (err) {
      callback(err);
    } else {
      if (userItems) {
        userItems.email = email;
      } else {
        // User hasn't been created
        userItems = {
          email: email,
          job: null,
          gold: config.gold,
          level: 1,
          hp: config.hp,
          tools: config.tools
        };
      }

      callback(null, userItems);
    }
  });
};
