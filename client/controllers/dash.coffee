setHeights = () ->
  paneCount = $('.pane').length
  height = $(window).height() - $('.header').height() - 50
  columns = Math.round(Math.sqrt(paneCount))
  rows = Math.ceil(paneCount / columns)
  $('.pane').height(height / rows)
  $('.pane').width((Math.floor(100 / columns) - 2) + '%')

  minPaneCount = paneCount - 1
  minPaneCols = Math.round(1.5 * Math.sqrt(minPaneCount))
  minPaneRows = Math.ceil(minPaneCount / minPaneCols)
  $('.minimized').height(height / (4 * minPaneRows))
  $('.minimized').width((Math.floor(100 / minPaneCols) - 2) + '%')
  $('.maximized').height(height * 3 / 4)
  $('.maximized').width('100%')

  $('.diagnosis').height(height)

color = d3.scale.category20()


Template.dash.rendered = () ->
  setHeights()
  $(window).resize(setHeights)

  if !this.initialized
    d3.json('../data/hmData.json', (err, obj) ->
      data = obj.features
      dataHandler.setTargetIncident(data[0])
      dataHandler.setData(data)
      $('.pane').children().trigger('resize')
    )
    this.initialized = true

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
    $('.pane').children().trigger('resize')

  "click .diagnosis .reactive-table tbody tr" : (event) ->
    Session.set('disease', @name)
    Session.set('features', keyword.name for keyword in @keywords)
