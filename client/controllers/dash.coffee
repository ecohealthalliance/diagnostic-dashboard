Template.dash.rendered = () ->
  height = window.innerHeight - $('.header').height()
  width = $('#dashboard-container').width()
  $('.pane').height(height / 2 - 20)
  $('.pane').width(width / 2 - 20)
  $('#dashboard-container').isotope
    itemSelector: '.pane'
    layoutMode: 'fitRows'
    getSortData:
      "selected": (element) ->
        !$(element).hasClass('selected')
    sortBy: "selected"



Template.dash.events
  "click .pane": (event) ->
    console.log('click')
    selectedPane = $(event.currentTarget)
    height = window.innerHeight - $('.header').height()
    width = $('#dashboard-container').width()
    $('.pane').removeClass('selected')
    $('.pane').height(height / 5)
    $('.pane').width(width / 5)
    selectedPane.height(4 * height / 5 - 50)
    selectedPane.width(4 * width / 5)
    selectedPane.addClass('selected')
    $('#dashboard-container').isotope('layout')
    $('#dashboard-container').isotope('updateSortData').isotope()
