support = require "./support"

module.exports =
  "clicking a date feature": (browser) ->
    support.openDashboard browser, {}, () ->
      browser
        .click ".features > .dates > .label"
        .waitForElementPresent "#timeline .plot > rect.selected", 500
        .getAttribute "#timeline rect.selected", "height", (result) ->
          browser
            .verify.equal result.value > 0, true, "Selected bin has > 0 height"
        .end()
