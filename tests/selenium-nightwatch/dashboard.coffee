mongo = require '../../.test_utils/built/mongo'

user =
  _id: "dashboarduser"
  emails: [
    {address: "dashboarduser@test.com"}
  ]
  services:
    password:
      bcrypt: "$2a$10$4qRN77SMMemyyQMoJJsiHe28nxplafrPSG7dlOe62FFUdCuRq2JrK"

password = "abcd1234"

result =
  _id: "testdashboard"
  content: "Five patients were hospitalized yesterday"
  userId: "dashboarduser"
  ready: true
  diseases: [
    {
      name: "Dengue"
      probability: 0.95
      keywords: [
        { name: "chills", score: 5.234 }
        { name: "headache", score: 3.4 }
      ]
    }
  ]
  features: [
    {
      type: "datetime"
      value: "2014-05-12T00:00:00"
      text: "May 12"
      startOffset: 11
      endOffset: 17
      dateInformation:
        year: 2014
        month: 5
        day: 12
    }
  ]

module.exports =

  "Setup": (browser) ->
    try
      mongo "users", "remove", {_id: user._id}, (err) ->
        if err then console.log err

        mongo "users", "insert", user, (err) ->
          if err then console.log err

          mongo "results", "remove", {_id: result._id}, (err) ->
            if err then console.log err

            mongo "results", "insert", result, (err) ->
              if err then console.log err

              browser.end()
    catch err
      console.log err
      browser.end()

  "Dashboard": (browser) ->
    browser
      .url "http://127.0.0.1:3000"
      .waitForElementVisible 'body', 1000
      # sign in
      .assert.visible '.sign-in'
      .click '.sign-in'
      .waitForElementVisible '#signIn', 1000
      .assert.visible '.entry-form'
      .setValue "input[type=email]", user.emails[0].address
      .setValue "input[type=password]", password
      .click ".submit"
      .waitForElementVisible '.user-info', 5000
      # go to dashboard
      .url "http://127.0.0.1:3000/dash/#{result._id}"
      .waitForElementVisible '.dashboard-container', 5000
      .end()
