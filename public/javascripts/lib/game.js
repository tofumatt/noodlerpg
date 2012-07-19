var Game = function() {
  var enemy = $('img.enemy');
  var stats = $('ol.stats');
  var statsDashboard = $('ol.dashboard-stats');
  var player = $('img.player');
  var fightAction = $('img.action');
  var message = $('.battle-message');

  var updateStats = function(options) {
    enemy.data('hp', options.enemy_hp);
    stats.find('#hp span').text(options.player_hp);
    stats.find('#damage span').text(options.enemy_damage);
    stats.find('#gold span').text(options.gold);
    stats.find('#xp span').text(options.xp);
    stats.find('#mp span').text(options.mp);
    stats.find('#enemy-hp span').text(options.enemy_hp);
  };

  var self = {
    refuel: function() {
      $.get('/refuel', function(data) {
        statsDashboard.find('#gold span').text(data.result.gold);
        statsDashboard.find('#hp span').text(data.result.hp);
      });
    },
    fight: function(self) {
      if (enemy.hasClass('alive') && player.hasClass('alive')) {
        var params = {
          level: self.parent().data('level'),
          enemy: enemy.data('enemy'),
          enemy_hp: enemy.data('hp'),
          tool: self.data('tool')
        };

        fightAction.fadeIn();

        $.post('/battle', params, function(data) {
          var playerHP = data.result.player_hp;
          var enemyHP = data.result.enemy_hp;
          var enemyDamage = data.result.enemy_damage;
          var gold = data.result.gold;
          var xp = data.result.xp;
          var mp = data.result.mp;

          if (enemyHP < 1 || playerHP < 1) {
            if (enemyHP < 1) {
              enemy.attr('src', enemy.attr('src').replace('-alive', '-dead'));
              enemy.addClass('dead').removeClass('alive');
              enemyHP = 0;
              message.text('You win!');
            } else {
              player.attr('src', player.attr('src').replace('-alive', '-dead'));
              player.addClass('dead').removeClass('alive');
              playerHP = 0;
              message.text('You lost :(');
            }
          }

          updateStats({
            player_hp: playerHP,
            enemy_hp: enemyHP,
            enemy_damage: enemyDamage,
            gold: gold,
            xp: xp,
            mp: mp
          });

          fightAction.fadeOut();
        });
      }
    }
  };

  return self;
};
