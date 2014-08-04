module.exports =
  "Splash Page" : (browser) ->
    browser
      .url "http://127.0.0.1:3000"
      .waitForElementVisible "body", 1000
      .assert.title "GRITS Diagnostic Dashboard"
      .verify.containsText "body", "Global Rapid Identification Tool System"
      .end()
