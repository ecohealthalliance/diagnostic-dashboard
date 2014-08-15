isMaximized = (pane) ->
  maximizedPane = Session.get('maximizedPane')
  if maximizedPane then (pane is maximizedPane) else false

isMinimized = (pane) ->
  maximizedPane = Session.get('maximizedPane')
  if maximizedPane then (pane isnt maximizedPane) else false

Template.paneContainer.height = (parent) ->
  paneCount = parent.panes.length
  columns = Math.round(Math.sqrt(paneCount))
  rows = Math.ceil(paneCount / columns)

  # get the absolute position of the bottom of the header
  top = $('.header').outerHeight(true)

  # get the full size for vis panes
  fullHeight = $(window).height() - top

  if isMaximized(@__templateName)
    Math.floor(fullHeight * 0.75)
  else if isMinimized(@__templateName)
    minPaneCount = paneCount - 1
    minPaneCols = Math.round(1.5 * Math.sqrt(minPaneCount))
    minPaneRows = Math.ceil(minPaneCount / minPaneCols)
    Math.floor((fullHeight * 0.25) / minPaneRows)
  else
    Math.floor(fullHeight / rows)

Template.paneContainer.width = (parent) ->
  paneCount = parent.panes.length
  columns = Math.round(Math.sqrt(paneCount))

  # width of the diagnostic side panal
  diagnosisWidth = 375

  # get the full size for vis panes
  fullWidth = $(window).width() - diagnosisWidth

  if isMaximized(@__templateName)
    fullWidth
  else if isMinimized(@__templateName)
    minPaneCount = paneCount - 1
    minPaneCols = Math.round(1.5 * Math.sqrt(minPaneCount))
    Math.floor(fullWidth / minPaneCols)
  else
    Math.floor(fullWidth / columns)

Template.paneContainer.paneContext = (parent) ->
  _.extend {
    height: Template.paneContainer.height.call @, parent
    width: Template.paneContainer.width.call @, parent
  }, parent.data


Template.paneContainer.events
  "click .pane:not(.maximized)": (event) ->
    Session.set('maximizedPane', @__templateName)
    selectedPane = $(event.currentTarget)
    selectedPane.hide()
    $('.pane').removeClass('maximized').addClass('minimized')
    selectedPane.removeClass('minimized').addClass('maximized')
    selectedPane.fadeIn()
