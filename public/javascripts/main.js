'use strict';

$(function() {
  var noodle = {};
  noodle.game = Game();
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
    noodle.game.fight($(this));
  });

  // Refueling
  var stats = $('ol.dashboard-stats');

  stats.on('click', '#refuel', function(ev) {
    ev.preventDefault();
    noodle.game.refuel();
  });
});
