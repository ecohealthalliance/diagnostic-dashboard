grits = @grits

Template.dash.created = ->
  @sideBarOpen = new ReactiveVar true
  @dashView = new ReactiveVar 'text'

Template.dash.rendered = ->
  Session.set('features', @data.features)
  @$('[data-toggle="tooltip"]').tooltip()

DISABLE_MULTI_HIGHLIGHT = true
color = (text) =>
  grits.services.color text

Template.dash.helpers
  eq: (a, b) ->
    a == b

  showCategory: (category, features) ->
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
      _.any @features or features, (feature) -> feature.type is category

  showKeypoints: ->
    Session.get('showKeypoints')

  hasCategory: (keywordCategories, categoryPattern) ->
    categoryRegex = new RegExp(categoryPattern)
    _.any keywordCategories, (keywordCategory) -> keywordCategory.match(categoryRegex)

  formatLocation: ->
    location = "#{@name}"
    admin1Code = @geoname['admin1 code'] # e.g., state
    location += ", #{admin1Code}" if admin1Code and /^[a-z]+$/i.test(admin1Code)
    countryCode = @geoname['country code']
    location += ", #{countryCode}" if countryCode
    location

  formatDate: ->
    if @value == "PAST_REF"
      return "Past reference"
    else if @value == "PRESENT_REF"
      return "Present reference"
    else if @value == "FUTURE_REF"
      return "Future reference"
    else
      # We don't want to display dates with more specificity than they possess.
      # But if we take a date like '2014-11' and create a JS Date with it, it will
      # be created with a specific day and time, and displayed as 11/1/2014.
      # Perhaps this could all be handled in a more elegant way by using some
      # library can that format arbitrary ISO date strings according to the local
      # date format, but for now, sniff our year-only and month-year-only strings
      # and turn them into slash-based dates in the month/year format.

      yearPat = /^\d{4}$/
      monthPat = /^\d{4}\-\d{2}$/

      if @value.match yearPat
        return @value
      else if @value.match monthPat
        return @value.substring(5,7) + '/' + @value.substring(0,4)
      else
        date = new Date(@value)
        date.setDate(date.getDate() + 1)
        dateString = date.toLocaleDateString()
        if dateString == 'Invalid Date'
          return @value
        else
          return dateString
  color: ->
    color grits.services.getIdKeyFromFeature(@)

  getIdKey: ->
    grits.services.getIdKeyFromFeature @

  selected: ->
    @name == Session.get('disease')

  tableSettings: ->
    fields: [
      {
        key: 'name',
        label: 'Disease'
        fn: (value) ->
          new Spacebars.SafeString("<span>#{value}</span>");
      },
      {
        key: 'probability'
        label: 'Confidence'
        sort: -1
        fn: (value) ->
          prob = value.toFixed(4) * 100
          new Spacebars.SafeString("<span>#{prob}%</span>");
      },
      {
        key: 'keywords'
        label: 'Characteristics'
        fn: (features) ->
          html = '<div>'
          _.each features, (feature) ->
            bgColor = color feature.name
            html += "<span style='background-color:#{bgColor}'></span>"
          html += '</div>'
          Spacebars.SafeString html
      }
    ]
    showNavigation: 'never'
    showFilter: false
    group: 'diagnosis'

  keywordCategories: =>
    grits.KEYWORD_CATEGORIES

  featureSelected: (feature) ->
    idKey = grits.services.getIdKeyFromFeature(feature)
    ids = _.map(Session.get('features') or [], grits.services.getIdKeyFromFeature)
    if _.contains(ids, idKey)
      "selected"
    else
      ""
  mailtoPromedLink: ->
    "mailto:promed@promedmail.org?subject=[GRITS] " +
    encodeURIComponent((d.name for d in @.diseases).join('/') + " Report") +
    "&body=" +
    encodeURIComponent("""
    This is a GRITS generated report.

    ***Include your name and affiliation***

    Dashboard url:
    #{window.location.toString()}

    Possible diagnoses:
    #{(d.name + ', confidence=' + Math.round(d.probability * 100) + '%' for d in @.diseases).join('\n')}

    Article:
    #{@.content}
    """)

  viewTypes: ->
    [
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

  useView: ->
    Template.instance().dashView.get()

  selectedView: ->
    if Template.instance().dashView.get() is @name
      'selected'

  viewIcon: ->
    if @name is 'text'
      'fa-file-text'
    else if @name is 'geomap'
      'fa-globe'
    else if @name is 'timeline'
      'fa-bar-chart'
    else if @name is 'symptomTable'
      'fa-table'

  sideBarOpen: ->
    Template.instance().sideBarOpen.get()

  sideBarState: ->
    Template.instance().sideBarOpen

  featuresSelected: ->
    Session.get('features').length

Template.dash.events
  "click .diagnosis .reactive-table tbody tr" : (event) ->
    $target = $(event.currentTarget)
    if $target.hasClass('selected')
      $target.removeClass('selected')
    else
      $target.addClass('selected').siblings().removeClass('selected')
    if Session.get('disease') is @name
      Session.set('disease', null)
      Session.set('features', [])
    else
      Session.set('disease', @name)
      Session.set('features', @keywords)

  "click .diagnosis .label" : (event) ->
    if Session.get('disease')
      Session.set('disease', null)
      Session.set('features', null)

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

  "click #choose-view li": (event, instance) ->
    instance.dashView.set $(event.currentTarget).data('view')

  "click .rediagnose": (event) ->
    bsveAccessKey = Router.current().params.query.bsveAccessKey
    submission = {
      prevDiagnosis: @
      content: @content
      accessKey: bsveAccessKey
    }
    Meteor.call('submit', submission, (error, resultId) ->
      if error
        alert "Could not rediagnose: " + error.message
      else
        Router.go 'dash', {_id: resultId}, {
          query: "bsveAccessKey=#{bsveAccessKey}" if bsveAccessKey
        }
    )

  "click .feature-section--header": (event, template) ->
    # Clicking a header can do one of two things:
    # - if any of the features for that category are currently not highlighted,
    # turn highlighting on for all features in that category
    # - if all features for the category are highlighted, turn them all off.
    # We assume that each name is unique per category

    # If a disease is selected, clicking a header unselects it
    if Session.get('disease')
      Session.set('disease', null)
      Session.set('features', [])

    category = $(event.currentTarget).data('category')

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
        .map(grits.services.getIdKeyFromFeature)
        .zip()
        .object()
        .value()
      for feature in categoryFeatures
        if not currentFeatureIdMap.hasOwnProperty(grits.services.getIdKeyFromFeature(feature))
          currentFeatures.push(feature)
      Session.set('features', currentFeatures)

  'click .side-bar-toggle': (event, instance) ->
    event.stopPropagation()
    sideBarState = instance.sideBarOpen
    sideBarState.set not sideBarState.get()

  'click .clear-annotations': ->
    Session.set 'features', []

Meteor.Spinner.options = { color: '#fff' }
