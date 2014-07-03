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

color = (text) =>
  @grits.services.color text


Template.search.rendered = () ->
  if !this.initialized
    setHeights()
    $(window).resize(setHeights)
    $('.pane-container').on('resetPanes', () ->
      $('.pane').removeClass('maximized').removeClass('minimized')
      setHeights()
    )
    this.initialized = true


Template.search.updatePanes = () ->
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

  window.grits.GirderItems.find({}).forEach((x)->
    console.log x.meta.diagnosis
  )

  locationFeatures = _.chain(window.grits.GirderItems.find().fetch())
    .pluck('meta').pluck('diagnosis').pluck('features')
    .flatten(true)
    .where({type : 'cluster'})
    .value()

  _.each(locationFeatures, (cluster) ->
    _.each(cluster.locations, (locationFeature) ->
        data.push {
          date: null
          latitude: locationFeature.latitude
          longitude: locationFeature.longitude
          location: locationFeature.name
        }
    )
  )


  $('.pane').children().trigger('datachanged', { data: data })
  ''

Diseases = new Meteor.Collection(null)

[
  "Dengue"
].forEach((x)->
  Diseases.insert({name : x})
)

Template.search.settings = ()->
  {
   position: "top",
   limit: 5,
   rules: [
     {
       collection: Diseases,
       field: "name",
       template: Template.searchPill,
       #matchAll: true,
       #filter: { type: "autocomplete" },
     }
   ]
  }
  
DiseasesSelected = new Meteor.Collection(null)

Deps.autorun ()->
  if DiseasesSelected.find().count() > 0
    Meteor.subscribe('item', {
      $or : DiseasesSelected.find().map((d)->
        {'meta.diagnosis.diseases.name' : d.name}
      )
    }, {
      onready : ()->
        console.log "reports loaded"
    })

Template.search.diseasesSelected = ()-> DiseasesSelected.find()

Template.search.events
  "click .pane:not(.maximized)": (event) ->
    selectedPane = $(event.currentTarget)
    selectedPane.hide()
    $('.pane').removeClass('maximized').addClass('minimized')
    selectedPane.removeClass('minimized').addClass('maximized')
    setHeights()
    selectedPane.fadeIn()

  "click #add-disease" : (event) ->
    DiseasesSelected.insert({name : $("#new-disease").val()})

  "click .remove-disease" : (event) ->
    DiseasesSelected.remove({name : $(event.currentTarget).data('name')})

  "click .reset-panels": (event) ->
    setHeights()

  "click .open-feedback": (event) =>
    $('form.feedback').show()
