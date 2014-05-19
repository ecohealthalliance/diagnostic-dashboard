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


Template.dash.rendered = () ->

  if !this.initialized
    d3.json('../data/hmData.json', (err, obj) ->

      # transform the geojson data into simplified format
      data = obj.features.map( (d) ->
        return {
          latitude: d.geometry.coordinates[1],
          longitude: d.geometry.coordinates[0],
          date: new Date(d.properties.date),
          location: d.properties.country
        }
      )
      $('.pane').children().trigger('datachanged', { data: data } )
    )
    setHeights()
    $(window).resize(setHeights)
    this.initialized = true

Template.dash.eq = (a, b) ->
  a == b

Template.dash.showCategory = (category) ->
  if category in ['datetime', 'caseCount', 'deathCount', 'cluster']
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
  admin1Code = @['admin1 code'] # e.g., state
  location += ", #{admin1Code}" if admin1Code and /^[a-z]+$/i.test(admin1Code)
  countryCode = @['country code']
  location += ", #{countryCode}" if countryCode
  location

Template.dash.formatDate = () ->
  date = new Date(@value)
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
    Session.set('features', keyword.name for keyword in @keywords)
