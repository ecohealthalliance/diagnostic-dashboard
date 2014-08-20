setHeights = () ->

  # width of the diagnostic side panal
  diagnosisWidth = 375

  # determine the layout
  paneCount = $('.pane').length
  columns = Math.round(Math.sqrt(paneCount))
  rows = Math.ceil(paneCount / columns)

  minPaneCount = paneCount - 1
  minPaneCols = Math.round(1.5 * Math.sqrt(minPaneCount))
  minPaneRows = Math.ceil(minPaneCount / minPaneCols)

  # get the absolute position of the bottom of the header
  top = $('.header').outerHeight(true)

  # get the full size for vis panes
  fullHeight = $(window).height() - top
  fullWidth = $(window).width() - diagnosisWidth

  defaultHeight = Math.floor(fullHeight / rows)
  defaultWidth = Math.floor(fullWidth / columns)

  maximizedHeight = Math.floor(fullHeight * 0.75)
  maximizedWidth = fullWidth

  minimizedHeight = Math.floor((fullHeight * 0.25) / minPaneRows)
  minimizedWidth = Math.floor(fullWidth / minPaneCols)

  $('.pane').height(defaultHeight)
  $('.pane').width(defaultWidth)

  $('.minimized').height(minimizedHeight)
  $('.minimized').width(minimizedWidth)
  $('.maximized').height(maximizedHeight)
  $('.maximized').width(maximizedWidth)

  $('.diagnosis').height(fullHeight)
  $('.diagnosis').width(diagnosisWidth)

  $('.pane').each (i, node) ->
    n = $(node)
    n.children().trigger('resizeApp', {
      width: n.width()
      height: n.height()
    })

color = (text) =>
  @grits.services.color text

Template.dash.rendered = () ->

  if !this.initialized
    setHeights()
    $(window).resize(setHeights)
    $('.pane-container').on('resetPanes', () ->
      $('.pane').removeClass('maximized').removeClass('minimized')
      setHeights()
    )
    this.initialized = true


Template.dash.updatePanes = () ->
  # updating the panes as a side effect of a template call is temporary
  dateFeatures = _.filter(@features, (feature) ->
    feature.type is 'datetime'
  )
  dates = _.map(dateFeatures, (feature) ->
    {
      date: new Date(feature.value)
      latitude: null
      longitude: null
      location: null
    }
  )

  locationFeatures = _.filter(@features, (feature) ->
    feature.type is 'location'
  )

  locations = []
  _.each(locationFeatures, (location) ->
      locations.push {
        date: null
        latitude: location.geoname.latitude
        longitude: location.geoname.longitude
        location: location.name
      }
    )

  Session.set('dates', dates)
  Session.set('locations', locations)

Template.dash.eq = (a, b) ->
  a == b

Template.dash.showCategory = (category) ->
  visibleCats = [
    'datetime'
    'location'
    'caseCount'
    'deathCount'
    'hospitalizationCount'
  ]
  if category in visibleCats
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
  if @categories
    color @categories[0] + @name
  else if @type in ['caseCount', 'hospitalizationCount', 'deathCount', 'datetime']
    color @type + @value
  else if @type in ['location']
    color @type + @name
  else if @text
    color @text

Template.dash.getIdKey = () ->
  Template.dash.getIdKeyFromFeature @

Template.dash.getIdKeyFromFeature = (feature) ->
  return '_' + _.indexOf(Session.get('features'), feature)

Template.dash.setActiveFeatureStyle = () ->

  # Reset all box shadows to original colors

  $(".features .label").each () ->
    $(this).css "box-shadow", "0px 0px 0px 2px " + $(this).attr "pillColor"

  activeFeatures = Session.get('features')
  for feature in activeFeatures
    idKey = Template.dash.getIdKeyFromFeature feature

    $("#" + idKey).css "box-shadow", "0px 0px 0px 2px #555"

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

Template.dash.events
  "click .pane:not(.maximized)": (event) ->
    selectedPane = $(event.currentTarget)
    selectedPane.hide()
    $('.pane').removeClass('maximized').addClass('minimized')
    selectedPane.removeClass('minimized').addClass('maximized')
    setHeights()
    selectedPane.fadeIn()

  "click .diagnosis .reactive-table tbody tr" : (event) ->
    Session.set('disease', @name)
    Session.set('features', keyword for keyword in @keywords)

  "click .diagnosis .label" : (event) ->
    if @textOffsets

      # We need to filter out any non-offset-based features. We can't handle
      # highlighting both kinds at the same time.

      currentFeatures = _.filter Session.get('features') or [], (feature) ->
        feature.textOffsets

      found = false
      for item, index in currentFeatures
        if _.isEqual(item, this)
          found = true
          currentFeatures.splice(index, 1)
          Session.set('features', currentFeatures)

      if not found
        currentFeatures.push(this)
        Session.set('features', currentFeatures)

    else
      Session.set('features', [this])

  "click .diagnosis .patient-description" : (event) ->
    $('.patient-description.selected').removeClass('selected')
    $(event.currentTarget).addClass('selected')
    this.color = 'goldenrod'
    Session.set('features', [this])

  "click .reset-panels": (event) ->
    setHeights()

  "click .open-feedback": (event) ->
    feedbackBaseData = {
      userId: Meteor.userId()
      diagnosisId: window.location.pathname.split('/').pop()
    }
    storedFeedback = grits.feedback.findOne(feedbackBaseData)
    # Dynamically load disease names for the autocomplete
    Meteor.subscribe('diseaseNames')
    # Clear the missing diseases collection
    missingDiseases.find().fetch().forEach((d)->
      missingDiseases.remove(d._id)
    )
    if storedFeedback
      Session.set('feedbackId', storedFeedback._id)
      # Repopulate feedback form so users can edit it later
      $('[name="comments"]').val(storedFeedback.comments)
      $('[name="general_comments"]').val(storedFeedback.generalComments)
      storedFeedback.correctDiseases?.forEach((d)->
        $('[name="' + d + '-correct"][value=true]').prop('checked', true)
      )
      storedFeedback.incorrectDiseases?.forEach((d)->
        $('[name="' + d + '-correct"][value=false]').prop('checked', true)
      )
      storedFeedback.missingDiseases?.forEach((d)->
        missingDiseases.insert(name : d)
      )
    else
      Session.set('feedbackId', grits.feedback.insert(
        _.extend({created: new Date()}, feedbackBaseData))
      )
    $('form.feedback').show()

  "click .rediagnose": (event) ->
    Meteor.call('rediagnose', @, (error, resultId) ->
      if error
        alert "Could not rediagnose: " + error.message
      else
        Router.go 'dash', {_id: resultId}
    )
  "click .features h4": (event, template) =>
    category = $(event.target).attr('class')
    if category in ['symptom', 'host', 'pathogen', 'transmi']
      source = template.data.keywords
      nameKey = 'name'
      # These are not offset-based at the moment, so punt
      return false
    else if category in ['caseCount', 'hospitalizationCount', 'deathCount', 'datetime']
      source = template.data.features
      nameKey = 'value'
    else if category is 'location'
      source = template.data.features
      nameKey = 'name'

   # Clicking a header can do one of two things:
    # - if any of the features for that category are currently not highlighted,
    # turn highlighting on for all features in that category
    # - if all features for the category are highlighted, turn them all off.
    # We assume that each name is unique per category

    categoryFeatures = _.filter source, (feature) -> feature.type is category

    categoryFeaturesActive = _.filter Session.get('features') or [], (feature) ->
      feature.type is category

    if categoryFeatures.length is categoryFeaturesActive.length
      featuresWithoutCategory = _.filter Session.get('features') or [], (feature) ->
        feature.type isnt category
      Session.set('features', featuresWithoutCategory)
    else
      currentFeatures = _.filter Session.get('features') or [], (feature) ->
        feature.textOffsets

      for feature in categoryFeatures
        alreadyActive = _.any Session.get('features') or [], (activeFeature) ->
          (feature['type'] == activeFeature['type']) and (feature[nameKey] == activeFeature[nameKey])
        if not alreadyActive
          currentFeatures.push(feature)
      Session.set('features', currentFeatures)

Meteor.Spinner.options = { color: '#fff' }
