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
});
