# generate a random username - test may fail if the username
# is already registered. we should write a setup method to
# delete a user that we can re-register.
username = "testuser#{Math.floor(Math.random()*100)}@test.com"
password = "abcd1234"

module.exports =

  "Register" : (browser) ->
    # test registering a new user
    browser
      .url "http://127.0.0.1:3000"
      .waitForElementVisible "body", 1000
      .assert.visible '.sign-in'
      .verify.containsText "body", "Register"
      # go to the register page
      .click '.sign-in'
      .waitForElementVisible '#signIn', 1000
      .click '.entry-signup-cta a'
      .waitForElementVisible '#signUp', 1000
      .assert.visible '.entry-form'
      # fill out form
      .setValue "input[type=email]", username
      .setValue "input[type=password]", password
      # this assumes no sign up code has been set,
      # so it can be anything. we should figure out
      # how to read the sign up code from mongo
      .setValue "input[name=signupCode]", "abcde"
      .click ".submit"
      # should be on the profile page
      .waitForElementVisible '.user-info', 5000
      .verify.containsText '.user-info', username
      .assert.visible '.sign-out'
      .click '.sign-out'
      .end()

  "Sign In and Out" : (browser) ->
    # test signing in and out
    browser
      .url "http://127.0.0.1:3000"
      .waitForElementVisible 'body', 1000
      # sign in
      .assert.visible '.sign-in'
      .click '.sign-in'
      .waitForElementVisible '#signIn', 1000
      .assert.visible '.entry-form'
      # fill out form with an incorrect username
      .setValue "input[type=email]", "this_is_not_a_username@test.com"
      .setValue "input[type=password]", "password"
      .click ".submit"
      .waitForElementVisible '.alert', 1000
      # try again with right username, wrong password
      .clearValue "input[type=email]"
      .setValue "input[type=email]", username
      .clearValue "input[type=password]"
      .setValue "input[type=password]", "wrong_password"
      .click ".submit"
      .waitForElementVisible '.alert', 1000
      # now try the right password
      .clearValue "input[type=password]"
      .setValue "input[type=password]", password
      .click ".submit"
      # should be on the profile page
      .waitForElementVisible '.user-info', 5000
      .verify.containsText '.user-info', username
      # sign out
      .assert.visible '.sign-out'
      .click '.sign-out'
      # should go back to the splash page
      .waitForElementVisible ".splash", 1000
      .assert.containsText "body", "Global Rapid Identification Tool System"
      .end()

  "Sign In Redirection" : (browser) ->
    # test redirection to and after sign in
    browser
      # attempt to go to the new diagnosis page
      .url "http://127.0.0.1:3000/new"
      # should be redirected to the sign in page
      .waitForElementVisible '.entry-form', 1000
      .assert.visible '.alert'
      .verify.containsText ".alert", "You must be signed in"
      # sign in
      .setValue "input[type=email]", username
      .setValue "input[type=password]", password
      .click ".submit"
      # should be on the new diagnosis page
      .waitForElementVisible ".submit-page", 1000
      .verify.containsText "body", "Diagnose"
      # sign out
      .assert.visible '.sign-out'
      .click '.sign-out'
      .end()
