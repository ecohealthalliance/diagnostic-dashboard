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

_content = "Five patients were hospitalized yesterday"
_idCount = 0

_diseases = [
  {
    name: "Dengue"
    probability: 0.95
    keywords: [
      { name: "chills", score: 5.234 }
      { name: "headache", score: 3.4 }
    ]
  }
]

_features = [
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
  },
  {
    type: "location"
    geoname: {
      latitude: 40.7127
      longitude: -74.0059
    }
    name: "New York City"
    "admin1 code": "NY"
    "country code": "US"
  }
]

_userCreated = false

# support parallel testing by creating an array of callbacks
# to be called after the user creation is done
_userCallbacks = []

waitForUser = (done) ->
  if ! _userCreated
    _userCallbacks.push done
  else
    done()

createUser = () ->
  mongo "users", "remove", {_id: user._id}, (err) ->
    if err then console.log err

    mongo "users", "insert", user, (err) ->
      if err then raise err
      _userCreated = true
      _userCallbacks.forEach (done) ->
        done()

createUser()

# add the result object to the mongo database
createResult = (result, done) ->
  waitForUser () ->
    mongo "results", "remove", {_id: result._id}, (err) ->
      if err then console.log err

      mongo "results", "insert", result, (err) ->
        if err then raise err
        done()

# Open a dashboard page with grits-api response preconfigured.
# Calls the callBack function with the browser object navigated
# to the correct dashboard page.
openDashboard = (browser, options, callBack) ->

  # this allows the caller to configure the result in a uniform way
  options = options || {}
  diseases = options.diseases || _diseases
  features = options.features || _features
  content = options.content || _content
  _idCount += 1
  _id = "testdashboard" + _idCount


  # do any mutations of the feature array to conform to current grits-api
  # features = features.map (feature) -> ...

  result =
    "_id": _id,
    "userId": user._id,
    "ready": true,
    "features": features,
    "diseases": diseases,
    "content": content

  createResult result, () ->
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
    callBack()

module.exports =
  "openDashboard": openDashboard
