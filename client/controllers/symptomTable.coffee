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
color = d3.scale.category20()


Template.symptomTable.rendered = () ->

  if !this.initialized
    setHeights()
    $(window).resize(setHeights)
    $('.pane-container').on('resetPanes', () ->
      $('.pane').removeClass('maximized').removeClass('minimized')
      setHeights()
    )
    this.initialized = true


Template.symptomTable.updatePanes = () ->
  # updating the panes as a side effect of a template call is temporary
  dateFeatures = _.filter(@features, (feature) ->
    feature.type is 'datetime'
  )
  data = _.map(dateFeatures, (feature) ->
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

  _.each(locationFeatures, (location) ->    
    data.push {
      date: null
      latitude: location.geoname.latitude
      longitude: location.geoname.longitude
      location: location.geoname.name
    }
  )


  $('.pane').children().trigger('datachanged', { data: data })
  ''


Template.symptomTable.eq = (a, b) ->
  a == b

Template.symptomTable.showCategory = (category) ->
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

Template.symptomTable.hasCategory = (keywordCategories, category) ->
  _.any(keywordCategories, (keywordCategory) ->
    keywordCategory.indexOf(category) >= 0
  )

Template.symptomTable.formatLocation = () ->
  location = "#{@name}"
  admin1Code = @['admin1 code'] # e.g., state
  location += ", #{admin1Code}" if admin1Code and /^[a-z]+$/i.test(admin1Code)
  countryCode = @['country code']
  location += ", #{countryCode}" if countryCode
  location

Template.symptomTable.formatDate = () ->
  date = new Date(@value)
  date.setDate(date.getDate() + 1)
  date.toLocaleDateString()

Template.symptomTable.color = () ->
  color @name

Template.symptomTable.selected = () ->
  @name == Session.get('disease')
  
Template.symptomTable.diagnosisId = () ->
  window.location.pathname.split('/').pop()

Template.symptomTable.symptomTableCollection = ()->
  if @diseases
    _.map @diseases, (disease)->
      diseaseClone = _.clone(disease)
      for kw in disease.keywords
        diseaseClone[kw.name] = kw.score
      diseaseClone

Template.symptomTable.tableSettings = () ->
  symptoms =
    _.chain(@diseases)
     .reduce( (sofar, disease) ->
         sofar.concat(_.pluck(disease.keywords, 'name'))
     , [])
     .uniq()
     .value()
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
  ].concat(_.map symptoms, (name)->
    {
      key: name
      label: name
      fn: (score) ->
        Math.round(score * 1000) / 1000
    }
  )
  showNavigation: 'never'
  showFilter: false


Template.symptomTable.events
  "click .pane:not(.maximized)": (event) ->
    selectedPane = $(event.currentTarget)
    selectedPane.hide()
    $('.pane').removeClass('maximized').addClass('minimized')
    selectedPane.removeClass('minimized').addClass('maximized')
    setHeights()
    selectedPane.fadeIn()

  "click .diagnosis .reactive-table tbody tr" : (event) ->
    Session.set('disease', @name)
    Session.set('features', keyword.name for keyword in @keywords)

  "click .reset-panels": (event) ->

      setHeights()
