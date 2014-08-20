color = (text) =>
  @grits.services.color text

Template.dash.panes = () ->
  [
    Template.geomapSimple
    Template.timelineSimple
    Template.text
  ]

Template.dash.paneData = () ->
  dateFeatures = _.filter(@features, (feature) ->
    feature.type is 'datetime'
  )
  dates = _.map(dateFeatures, (feature) ->
    {
      date: new Date(feature.value)
    }
  )

  locationFeatures = _.filter(@features, (feature) ->
    feature.type is 'location'
  )

  locations = _.map(locationFeatures, (location) ->
    {
      latitude: location.geoname.latitude
      longitude: location.geoname.longitude
      location: location.name
    }
  )

  {
    dates: dates
    locations: locations
    content: @content
  }

Template.dash.diagnosisHeight = () ->
  # get the absolute position of the bottom of the header
  top = $('.header').outerHeight(true)

  # get the full size for vis panes
  $(window).height() - top

Template.dash.eq = (a, b) ->
  a == b

Template.dash.showCategory = (category) ->
  if category in ['datetime', 'caseCount', 'deathCount', 'hospitalizationCount', 'location']
    _.any(@features, (feature) ->
      feature.type is category
    )
  else
    _.any(@keywords, (keyword) ->
      _.any(keyword.categories, (keywordCategory) ->
        keywordCategory.indexOf(category) >= 0
      )
    )

Template.dash.hasCategory = (keywordCategories, category) ->
  _.any(keywordCategories, (keywordCategory) ->
    keywordCategory.indexOf(category) >= 0
  )

Template.dash.formatLocation = () ->
  location = "#{@name}"
  admin1Code = @geoname['admin1 code'] # e.g., state
  location += ", #{admin1Code}" if admin1Code and /^[a-z]+$/i.test(admin1Code)
  countryCode = @geoname['country code']
  location += ", #{countryCode}" if countryCode
  location

Template.dash.formatDate = () ->
  date = new Date(@value)
  date.setDate(date.getDate() + 1)
  date.toLocaleDateString()

Template.dash.color = () ->
  color @name

Template.dash.selected = () ->
  @name == Session.get('disease')

Template.dash.tableSettings = () ->
  fields: [
    {
      key: 'probability'
      label: 'Probability'
      sort: -1
      fn: (prob) ->
        Math.round(prob * 1000) / 1000
    },
    {
      key: 'name'
      label: ' '
      fn: (name) ->
        if Session.equals('disease', name)
          Spacebars.SafeString '<span style="color: green">&#10004;</span>'
    },
    { key: 'name', label: 'Disease' },
    {
      key: 'keywords'
      label: 'Characteristics'
      fn: (features) ->
        html = ""
        _.each features, (feature) ->
          featureColor = color feature.name
          html += "<span style='background-color:#{featureColor}'>&nbsp;</span>&ensp;"
        Spacebars.SafeString html
    }
  ]
  showNavigation: 'never'
  showFilter: false
  group: 'diagnosis'

Template.dash.rendered = () ->
  Session.set('maximizedPane', 'text')
  $('.pane').addClass('minimized')
  $('#text').parent().addClass('maximized')

Template.dash.events
  "click .diagnosis .reactive-table tbody tr" : (event) ->
    Session.set('disease', @name)
    Session.set('features', keyword for keyword in @keywords)

  "click .diagnosis .label" : (event) ->
    Session.set('features', [this])

  "click .reset-panels": (event) ->
    Session.set('maximizedPane', '')
    $('.pane').removeClass('maximized').removeClass('minimized')

  "click .open-feedback": (event) ->
    $('form.feedback').show()

  "click .rediagnose": (event) ->
    Meteor.call('rediagnose', @, (error, resultId) ->
      if error
        alert "Could not rediagnose: " + error.message
      else
        Router.go 'dash', {_id: resultId}
    )

Meteor.Spinner.options = { color: '#fff' }
