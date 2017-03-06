@grits ?= {}
@grits.services ?= {}
@grits.services.dates =
  # Number of years into the future from today - determines which dates to
  # filter out (constant)
  FUTURE_DATE_LIMIT: 10

  ###
  # isWithinRange - Determines should be displayed - is not too far into future
  #
  # @param {object} date, date object
  # @return {boolean}
  ###
  isWithinRange: (date) ->
    dateValue = date.getTime()
    return false if _.isNaN(dateValue)
    today = new Date()
    futureDate = new Date().setFullYear(today.getFullYear() + @FUTURE_DATE_LIMIT)
    dateValue <= futureDate
