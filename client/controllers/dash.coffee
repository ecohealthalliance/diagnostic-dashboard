setHeights = () ->
  height = $(window).height() - $('.header').height() - 50
  $('.pane').height(height / 2)
  $('.minimized').height(height / 4)
  $('.maximized').height(height * 3 / 4)
  $('.diagnosis').height(height)

color = d3.scale.category20()


Template.dash.rendered = () ->
  setHeights()
  $(window).resize(setHeights)

Template.dash.symptoms = () ->
  symptoms = []
  _.each @diseases, (disease) ->
    symptoms = symptoms.concat disease.symptoms
  _.unique symptoms

Template.dash.color = () ->
  color this

Template.dash.tableSettings = () ->
  fields: [
    { key: 'rank', label: 'Rank' },
    { key: 'name', label: 'Disease' },
    {
      key: 'symptoms'
      label: 'Symptoms'
      fn: (symptoms) ->
        html = ""
        _.each symptoms, (symptom) ->
          symptomColor = color symptom
          html += "<span style='background-color:#{symptomColor}'>&nbsp;</span>&ensp;"
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
    $('#dendrogram').dendrogramLocal('refresh')

  "click .diagnosis .reactive-table tbody tr" : (event) ->
    Session.set('disease', @name)
    $('#dendrogram').trigger('datachanged', @symptoms)
