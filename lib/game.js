'use strict';

var user = require('./user');
var jobs = require('../config/jobs');
var tools = require('../config/tools');

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

/* Game battle
 * Requires: web request, db connection
 * Returns: resulting user stats during battle
 */
exports.battle = function(req, enemy, db, callback) {
  var enemyHP = enemy.hp;
  var gold = 0;

  var getToolDamage = function() {
    var toolDamage = 1;

    if (req.session.tool) {
      for(var i = 0; i < tools.length; i ++) {
        if (tools[i].name === req.session.tool) {
          toolDamage = Math.floor(Math.random() *
            (tools[i].damage_high_range - tools[i].damage_low_range + 1)) +
            tools[i].damage_low_range;
          break;
        }
      }
    }

    return toolDamage;
  };

  for(var i = 0; i < jobs.length; i ++) {
    if (jobs[i].name === req.session.job) {

      // player damage
      var playerDamage = Math.floor(Math.random() *
        (enemy.damage_high_range - enemy.damage_low_range + 1)) +
        enemy.damage_low_range;

      // enemy damage
      var speedMultiplier = Math.floor(Math.random() *
        (jobs[i].speed_multiplier_high_range - jobs[i].speed_multiplier_low_range + 1)) +
        jobs[i].speed_multiplier_low_range;
      var toolDamage = getToolDamage();

      var enemyDamage = toolDamage * speedMultiplier;

      req.session.hp = req.session.hp - playerDamage;

      // user always gets first attack (for now)
      // if they lose, we just assume it is an immediate loss
      if (req.session.hp < 0) {
        req.session.hp = 0;

      } else {
        enemyHP = enemyHP - enemyDamage;

        if (enemyHP < 0) {
          enemyHP = 0;

          // enemy is dead, so let's count up the gold
          gold = Math.floor(Math.random() *
            (enemy.gold_high_range - enemy.gold_low_range + 1)) +
            enemy.gold_low_range;
        }
      }
      break;
    }
  }

  user.saveStats(req, db, function(err, user) {
    if (err) {
      callback(err);
    } else {
      var result = {
        playerHP: user.hp,
        enemyHP: enemyHP,
        gold: gold
      };

      callback(null, result);
    }
  });
};
