setHeights = () ->

  # minimum sizes for minimized panes
  minimizedWidth = 350
  minimizedHeight = 150

  # width of the diagnostic side panal
  diagnosisWidth = 375

  # minimum sizes for the maximized pane
  maximizedWidth = 600
  maximizedHeight = 500

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
          date: d.properties.date
        }
      )
      $('.pane').children().trigger('datachanged', { data: data } )
    )
    setHeights()
    $(window).resize(setHeights)
    this.initialized = true

Template.dash.isKeyword = () ->
  @type is 'keyword'

Template.dash.isDate = () ->
  @type is 'datetime'

Template.dash.parseDate = () ->
  new Date(Date.parse(@value))

Template.dash.isCaseCount = () ->
  @type is 'caseCount'

Template.dash.color = () ->
  color @value

Template.dash.selected = () ->
  _.values(this).join('') in (Session.get('features') or [])

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
