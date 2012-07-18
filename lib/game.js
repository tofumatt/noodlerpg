'use strict';

var user = require('./user');
var battleConstant = 3;

var enemyDamageGenerator = function(req) {
  var job = req.session.job;
  var tools = req.session.tools;
  var tool;

  for (var i = 0; i < tools.length; i ++) {
    if (tools[i].name.toLowerCase() === req.body.tool.toLowerCase()) {
      tool = tools[i];
      break;
    }
  }

  var speedJobMultiplier = Math.floor(Math.random() *
    (job.speed_multiplier_high_range - job.speed_multiplier_low_range + 1)) +
    job.speed_multiplier_low_range;

  var magicJobMultiplier = Math.floor(Math.random() *
    (job.mp_multiplier_high_range - job.mp_multiplier_low_range + 1)) +
    job.mp_multiplier_low_range;

  var moxieJobMultiplier = Math.floor(Math.random() *
    (job.moxie_multiplier_high_range - job.moxie_multiplier_low_range + 1)) +
    job.moxie_multiplier_low_range;

  var toolDamage = Math.floor(Math.random() *
    (tool.damage_high_range - tool.damage_low_range + 1)) +
    tool.damage_low_range;

  var toolMagic = Math.floor(Math.random() *
    (tool.mp_high_range - tool.mp_low_range + 1)) +
    tool.mp_low_range;

  return (toolDamage * speedJobMultiplier) + (magicJobMultiplier * toolMagic) *
    (moxieJobMultiplier * (toolDamage + toolMagic) / battleConstant);
};

var playerDamageGenerator = function(enemy) {
  return Math.floor(Math.random() *
    (enemy.damage_high_range - enemy.damage_low_range + 1)) +
    enemy.damage_low_range;
};

/* Game battle
 * Requires: web request, db connection
 * Returns: resulting user stats during battle
 */
exports.battle = function(req, enemy, db, callback) {
  var gold = 0;
  var enemyHP = req.body.enemy_hp;

  // if user loses, we just assume it is an immediate loss
  if (req.session.hp < 1) {
    req.session.hp = 0;

  } else if (enemyHP < 1) {
    enemyHP = 0;

    // enemy is dead, so let's count up the gold
    gold = Math.floor(Math.random() *
      (enemy.gold_high_range - enemy.gold_low_range + 1)) +
      enemy.gold_low_range;
  } else {
    var playerDamage = playerDamageGenerator(enemy);
    var enemyDamage = enemyDamageGenerator(req);

    req.session.hp = req.session.hp - playerDamage;
    enemyHP = enemyHP - enemyDamage;
  }

  user.saveStats(req, db, function(err, user) {
    if (err) {
      callback(err);
    } else {
      var result = {
        player_hp: user.hp,
        enemy_hp: enemyHP,
        gold: gold,
        enemy_damage: enemyDamage
      };

      callback(null, result);
    }
  });
};
