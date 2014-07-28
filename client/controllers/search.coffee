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
  data = []
  
  locationFeatures = grits.Girder.Items.find().fetch()

  # we can probably get a better location name from the diagnosis

  data = locationFeatures.map (d) ->
    location: d.meta.country
    summary: d.description
    date: d.meta.date
    disease: d.meta.disease
    link: d.meta.link
    species: d.meta.species
    feed: d.meta.feed
    latitude: d.meta.latitude
    longitude: d.meta.longitude
    name: d.name

  Session.set('locations', data)
  ''

DiseaseNames = () =>
  @grits.Girder.DiseaseNames

Keywords = () =>
  @grits.Girder.Keywords

Template.search.diseaseCompleteSettings = ()->
  {
   position: "top",
   limit: 5,
   rules: [
     {
       collection: DiseaseNames(),
       field: "_id",
       template: Template.searchPill,
     }
   ]
  }

Template.search.additionalResults = ()->
  Session.get("additionalResults", true) or false

Template.search.keywordCompleteSettings = ()->
  {
   position: "top",
   limit: 5,
   rules: [
     {
       collection: Keywords(),
       field: "_id",
       template: Template.searchPill,
     }
   ]
  }

@DiseasesSelected = new Meteor.Collection(null)
@AnyKeywordsSelected = new Meteor.Collection(null)
@AllKeywordsSelected = new Meteor.Collection(null)

Deps.autorun ()->
  conditions = []
  if DiseasesSelected.find().count() > 0
    conditions.push({
      $or : DiseasesSelected.find().map((d)->
        {'meta.diagnosis.diseases.name' : d.name}
      )
    })
  if AnyKeywordsSelected.find().count() > 0
    conditions.push({
      'meta.diagnosis.keywords_found.name' : {
        $in : AnyKeywordsSelected.find().map((k)-> k.name)
      }
    })
  if AllKeywordsSelected.find().count() > 0
    conditions.push({
      'meta.diagnosis.keywords_found.name' : {
        $all : AllKeywordsSelected.find().map((k)-> k.name)
      }
    })
  
  if conditions.length > 0
    limit = Session.get('skip') + grits.searchLimit
    Session.set("additionalResults", false)
    Meteor.subscribe('item', {
      $and : conditions
    }, {
      limit : limit
    }, {
      onReady : (x,y)->
        if grits.Girder.Items.find().count() >= limit
          Session.set("additionalResults", true)
        console.log "reports loaded"
    })

Template.search.diseasesSelected = ()-> DiseasesSelected.find()
Template.search.anyKeywordsSelected = ()-> AnyKeywordsSelected.find()
Template.search.allKeywordsSelected = ()-> AllKeywordsSelected.find()

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
    Session.get('skip', 0)

  "click .remove-disease" : (event) ->
    DiseasesSelected.remove({name : $(event.currentTarget).data('name')})
    Session.get('skip', 0)

  "click #add-any-keyword" : (event) ->
    AnyKeywordsSelected.insert({name : $("#new-any-keyword").val()})
    Session.set('skip', 0)

  "click .remove-any-keyword" : (event) ->
    AnyKeywordsSelected.remove({name : $(event.currentTarget).data('name')})
    Session.set('skip', 0)

  "click #add-all-keyword" : (event) ->
    AllKeywordsSelected.insert({name : $("#new-all-keyword").val()})
    Session.set('skip', 0)

  "click .remove-all-keyword" : (event) ->
    AllKeywordsSelected.remove({name : $(event.currentTarget).data('name')})
    Session.set('skip', 0)

  "click .reset-panels": (event) ->
    setHeights()

  "click #load-more-results" : (event) ->
    console.log("x")
    console.log grits.searchLimit
    Session.set('skip', Session.get('skip') + grits.searchLimit)
