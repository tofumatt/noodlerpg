'use strict';

var config = require('../config/defaults');
var user = require('./user');
var battleConstant = 3;
var levelConstant = 5;

var multiplier = function(high_range, low_range) {
  return Math.floor(Math.random() * (high_range - low_range + 1)) + low_range;
};

var enemyDamageGenerator = function(req) {
  var job = req.session.job;
  var tools = req.session.tools;
  var tool = tools[req.body.tool];

  var speedJobMultiplier = multiplier(job.speed_multiplier_high_range, job.speed_multiplier_low_range);
  var magicJobMultiplier = multiplier(job.mp_multiplier_high_range, job.mp_multiplier_low_range);
  var moxieJobMultiplier = multiplier(job.moxie_multiplier_high_range, job.moxie_multiplier_low_range);
  var xpMultiplier = req.session.xp + req.session.level;
  var toolDamage = multiplier(tool.damage_high_range, tool.damage_low_range);
  var toolMagic = multiplier(tool.mp_high_range, tool.mp_low_range);

  return (toolDamage * speedJobMultiplier) + (magicJobMultiplier * toolMagic) *
    (moxieJobMultiplier * (toolDamage + toolMagic) + (xpMultiplier * toolDamage) / battleConstant);
};

var playerDamageGenerator = function(enemy) {
  return multiplier(enemy.damage_high_range, enemy.damage_low_range);
};

/* Game battle
 * Requires: web request, db connection
 * Returns: resulting user stats during battle
 */
exports.battle = function(req, enemy, db, callback) {
  var gold = req.session.gold;
  var xp = req.session.xp;
  var mp = req.session.mp;
  var enemyDamage = 0;
  var enemyHP = parseInt(req.body.enemy_hp, 10) || enemy.hp;
  var playerDamage = playerDamageGenerator(enemy);

  enemyDamage = enemyDamageGenerator(req);

  req.session.hp = req.session.hp - playerDamage;
  enemyHP = enemyHP - enemyDamage;

  if (req.session.hp < 1) {
    req.session.hp = 0;

  } else if (enemyHP < 1) {
    enemyHP = 0;

    // enemy is dead, so let's count up the gold
    gold = multiplier(enemy.gold_high_range, enemy.gold_low_range);
    gold += req.session.gold;
    req.session.gold = gold;

    // let's also calculate the xp
    xp = multiplier(enemy.xp_high_range, enemy.xp_low_range);
    xp += req.session.xp;
    req.session.xp = xp;

    /* Calculate to see if player can level up
     * Formula is currently: (x * x + x) * 5
     */
    var currentLevel = (req.session.level * req.session.level + req.session.level) * levelConstant;
    if (currentLevel < req.session.xp) {
      req.session.level = req.session.level + 1;
    }
  }

  user.saveStats(req, db, function(err, user) {
    if (err) {
      callback(err);
    } else {
      var result = {
        player_hp: user.hp,
        enemy_hp: enemyHP,
        gold: gold,
        enemy_damage: enemyDamage,
        xp: xp,
        mp: mp
      };

      callback(null, result);
    }
  });
};
