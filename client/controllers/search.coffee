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

  # It would be cool if we could highligh all the points for a given article 
  # when someone clicks one.

  data = _.chain(locationFeatures.map (d) ->
    if d.meta.diagnosis?.features
      d.meta.diagnosis.features.map (f)->
        if f.type == "location"
          location: f.geoname.name
          summary: d.description
          date: d.meta.date
          disease: d.meta.disease
          link: d.meta.link
          species: d.meta.species
          feed: d.meta.feed
          latitude: f.geoname.latitude
          longitude: f.geoname.longitude
          name: d.name
    ).flatten(true).filter((x)->x).value()
    
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
  # TODO: Debounce
  disease_terms = DiseasesSelected.find().map (k)->
    term :
      'meta.disease' : k.name
  
  should_terms = AnyKeywordsSelected.find().map (k)->
    term :
      'private.scrapedData.content'  : k.name
  
  must_terms = AllKeywordsSelected.find().map (k)->
    term : 
      'private.scrapedData.content' : k.name
  
  if [].concat(disease_terms, should_terms, must_terms).length > 0
    
    Meteor.call('elasticsearch', {
      query:
        bool:
          must: must_terms
          should: [].concat(disease_terms, should_terms)
    }, (e,r)->
      console.log(r)
      Session.set('searchResults', (hit._source for hit in r.hits.hits))
    )

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
    kwName = $("#new-disease").val()
    if DiseaseNames().findOne({_id : kwName})
      DiseasesSelected.insert({name : kwName})
    else
      alert("You can only search for terms in the auto-complete menu.")

  "click .remove-disease" : (event) ->
    DiseasesSelected.remove({name : $(event.currentTarget).data('name')})

  "click #add-any-keyword" : (event) ->
    kwName = $("#new-any-keyword").val()
    AnyKeywordsSelected.insert({name : kwName})

  "click .remove-any-keyword" : (event) ->
    AnyKeywordsSelected.remove({name : $(event.currentTarget).data('name')})

  "click #add-all-keyword" : (event) ->
    kwName = $("#new-all-keyword").val()
    console.log(Keywords().find().fetch())
    AllKeywordsSelected.insert({name : kwName})

  "click .remove-all-keyword" : (event) ->
    AllKeywordsSelected.remove({name : $(event.currentTarget).data('name')})

  "click .reset-panels": (event) ->
    setHeights()
