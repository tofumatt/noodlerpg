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
});
