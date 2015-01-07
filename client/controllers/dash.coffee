DISABLE_MULTI_HIGHLIGHT = true
color = (text) =>
  @grits.services.color text

Template.dash.eq = (a, b) ->
  a == b

Template.dash.showCategory = (category, features) ->

  visibleCats = [
    'datetime'
    'location'
    'caseCount'
    'deathCount'
    'hospitalizationCount'
    'diseases'
    'hosts'
    'modes'
    'pathogens'
    'symptoms'
  ]
  if category in visibleCats
    _.any(@features or features, (feature) ->
      feature.type is category
    )

Template.dash.showKeypoints = ()->
  Session.get('showKeypoints')

Template.dash.hasCategory = (keywordCategories, categoryPattern) ->
  categoryRegex = new RegExp(categoryPattern)
  _.any(keywordCategories, (keywordCategory) ->
    keywordCategory.match(categoryRegex)
  )

Template.dash.formatLocation = () ->
  location = "#{@name}"
  admin1Code = @geoname['admin1 code'] # e.g., state
  location += ", #{admin1Code}" if admin1Code and /^[a-z]+$/i.test(admin1Code)
  countryCode = @geoname['country code']
  location += ", #{countryCode}" if countryCode
  location

Template.dash.formatDate = () ->
  if @value == "PAST_REF"
    return "Past reference"
  else if @value == "PRESENT_REF"
    return "Present reference"
  else if @value == "FUTURE_REF"
    return "Future reference"
  else
    date = new Date(@value)
    date.setDate(date.getDate() + 1)
    dateString = date.toLocaleDateString()
    if dateString == 'Invalid Date'
      return @value
    else
      return dateString

Template.dash.color = () ->
  color Template.dash.getIdKeyFromFeature(@)

Template.dash.getIdKey = () ->
  Template.dash.getIdKeyFromFeature @

Template.dash.getIdKeyFromFeature = (feature) ->
  if feature.textOffsets
    # ids are generated from offsets so that features with content that appears
    # in mutiple places (e.g. counts) can be individually highlighted.
    return feature.type + '-o-' + feature.textOffsets.map((o)-> o[0] + '_' + o[1]).join('-')
  idKey = feature.name or feature.text or String(feature.value)
  idKey.replace(/[^A-Za-z0-9]/g, '_')

Template.dash.selected = () ->
  @name == Session.get('disease')

Template.dash.tableSettings = () ->
  fields: [
    {
      key: 'probability'
      label: 'Confidence'
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

Template.dash.keywordCategories = () =>
  @grits.KEYWORD_CATEGORIES

Template.dash.featureSelected = (feature) ->
  idKey = Template.dash.getIdKeyFromFeature(feature)
  ids = _.map(Session.get('features') or [], Template.dash.getIdKeyFromFeature)
  if _.contains(ids, idKey)
    "selected"
  else
    ""

Template.dash.viewTypes = [
  {
    name: "text"
    label: "Text"
  }, {
    name: "geomap"
    label: "Map"
  }, {
    name: "timeline"
    label: "Timeline"
  }, {
    name: "symptomTable"
    label: "Detailed Diagnosis"
  }
]

Template.dash.useView = ()->
  Session.get("dashView")

Template.dash.events
  "click .diagnosis .reactive-table tbody tr" : (event) ->
    if Session.get('disease') is @name
      Session.set('disease', null)
      Session.set('features', [])
    else
      Session.set('disease', @name)
      Session.set('features', @keywords)

  "click .diagnosis .label" : (event) ->
    currentFeatures = Session.get('features') or []

    found = false
    for item, index in currentFeatures
      if _.isEqual(item, this)
        found = true
        currentFeatures.splice(index, 1)
        Session.set('features', currentFeatures)

    if not found
      currentFeatures.push(this)
      Session.set('features', currentFeatures)

  "click .diagnosis .keypoint" : (event) ->
    $('.keypoint.selected').removeClass('selected')
    $(event.currentTarget).addClass('selected')
    this.color = 'goldenrod'
    Session.set('features', [this])

  "change #choose-view": (event) ->
    Session.set('dashView', $(event.target).val())

  "click .open-feedback": (event) ->
    feedbackBaseData = {
      userId: Meteor.userId()
      diagnosisId: @._id
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

  "click .features h4": (event, template) ->
    # Clicking a header can do one of two things:
    # - if any of the features for that category are currently not highlighted,
    # turn highlighting on for all features in that category
    # - if all features for the category are highlighted, turn them all off.
    # We assume that each name is unique per category
    
    # If a disease is selected, clicking a header unselects it
    if Session.get('disease')
      Session.set('disease', null)
      Session.set('features', [])

    category = $(event.target).attr('class')
    if category in ['caseCount', 'hospitalizationCount', 'deathCount',
                    'datetime', 'diseases', 'hosts', 'modes', 'pathogens',
                    'symptoms']
      source = template.data.features
    else if category is 'location'
      source = template.data.features

    categoryFeatures = _.filter source, (feature) -> feature.type is category

    categoryFeaturesActive = _.filter Session.get('features') or [], (feature) ->
      feature.type is category

    if categoryFeatures.length <= categoryFeaturesActive.length
      featuresWithoutCategory = _.filter Session.get('features') or [], (feature) ->
        feature.type isnt category
      Session.set('features', featuresWithoutCategory)
      if categoryFeaturesActive.length > categoryFeatures.length
        console.log("Error: Number of active features greater than features available.")
    else
      currentFeatures = Session.get('features') or []
      currentFeatureIdMap = _.chain(currentFeatures)
        .map(Template.dash.getIdKeyFromFeature)
        .zip()
        .object()
        .value()
      for feature in categoryFeatures
        if not currentFeatureIdMap.hasOwnProperty(Template.dash.getIdKeyFromFeature(feature))
          currentFeatures.push(feature)
      Session.set('features', currentFeatures)

Meteor.Spinner.options = { color: '#fff' }
