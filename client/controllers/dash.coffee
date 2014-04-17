setHeights = () ->
  height = $(window).height() - $('.header').height() - 50
  $('.pane').height(height / 2)
  $('.minimized').height(height / 4)
  $('.maximized').height(height * 3 / 4)


Template.dash.rendered = () ->
  setHeights()
  $(window).resize(setHeights)


Template.dash.events
  "click .pane": (event) ->
    selectedPane = $(event.currentTarget)
    selectedPane.hide()
    $('.pane').removeClass('maximized').addClass('minimized')
    selectedPane.removeClass('minimized').addClass('maximized')
    setHeights()
    selectedPane.fadeIn()
