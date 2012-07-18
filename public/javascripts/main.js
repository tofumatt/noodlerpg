'use strict';

$(function() {
  var loginForm = $('form#login-form');

  // Persona login
  loginForm.on('click', '#login', function() {
    navigator.id.getVerifiedEmail(function(assertion) {
      if (assertion) {
        loginForm.find('input[name="bid_assertion"]').val(assertion);
        loginForm.submit();
      }
    });
  });

  // Job selection
  var jobList = $('ul.jobs');

  jobList.on('click', 'li', function() {
    var self = $(this);
    $.post('/job', { job: self.data('job') }, function(data) {
      document.location = '/';
    });
  });

  // Battle action
  var tools = $('ol.tools');

  tools.on('click', 'li', function() {
    var self = $(this);
    var enemy = $('img.enemy');
    var stats = $('ol.stats');
    var player = $('img.player');

    if (enemy.hasClass('alive') && player.hasClass('alive')) {
      var params = {
        level: self.parent().data('level'),
        enemy: enemy.data('enemy'),
        enemy_hp: enemy.data('hp'),
        tool: self.data('tool')
      };

      $.post('/battle', params, function(data) {
        if (data.result.enemy_hp < 1 || data.result.player_hp < 1) {
          if (data.result.enemy_hp < 1) {
            enemy.attr('src', enemy.attr('src').replace('-alive', '-dead'));
            enemy.addClass('dead').removeClass('alive');
            enemy.data('hp', 0);
            stats.find('#hp span').text(data.result.player_hp);
            stats.find('#damage span').text(data.result.enemy_damage);
          } else {
            player.attr('src', player.attr('src').replace('-alive', '-dead'));
            player.addClass('dead').removeClass('alive');
            stats.find('#hp span').text(0);
          }
        } else {
          enemy.data('hp', data.result.enemy_hp);
          stats.find('#hp span').text(data.result.player_hp);
          stats.find('#damage span').text(data.result.enemy_damage);
          stats.find('#gold span').text(data.result.gold);
        }
      });
    }
  });
});
