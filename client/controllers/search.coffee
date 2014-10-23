Template.search.eq = (a, b)->
  a == b

Template.search.timestampToMonthYear = (t) ->
  date = new Date(t)
  (date.getMonth() + 1) + '-' + date.getFullYear()

Template.search.updatePanes = () ->
  data = []
  
  searchResults = Session.get('searchResults') or []

  # It would be cool if we could highligh all the points for a given article 
  # when someone clicks one.

  data = _.chain(searchResults.map (d) ->
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
@CountriesSelected = new Meteor.Collection(null)

removeEmptyKeys = (obj)->
  out = {}
  for own k, v of obj
    if _.isArray(v)
      if v.length == 0
        continue
      else
        out[k] = v
    else if _.isObject(v)
      nestedObj = removeEmptyKeys(v)
      if not _.isEmpty(nestedObj)
        out[k] = nestedObj
    else
      out[k] = v
  return out
doQuery = _.debounce(((query)->
  # Remove empty array keys so that we don't end up with no results because
  # a filter has no clauses.
  query = removeEmptyKeys(query)
  console.log(query)
  Session.set('searching', true)
  Meteor.call('elasticsearch', query, (e,r)->
    if e
      console.error(e)
      alert("Error")
      return
    console.log(r)
    Session.set('searching', false)
    Session.set('searchResults', (hit._source for hit in r.hits.hits))
    Session.set('totalResults', r.hits.total)
    Session.set('aggregations', r.aggregations)
  )
), 1000)

Deps.autorun(()->
  disease_terms = DiseasesSelected.find().map (k)->
    match_phrase :
      'meta.disease' : k.name.toLowerCase()
  
  should_terms = AnyKeywordsSelected.find().map (k)->
    match_phrase :
      'private.scrapedData.content'  : k.name.toLowerCase()
  
  must_terms = AllKeywordsSelected.find().map (k)->
    match_phrase : 
      'private.scrapedData.content' : k.name.toLowerCase()
  
  query = {}
  if [].concat(disease_terms, should_terms, must_terms).length > 0
    query =
      bool:
        must: must_terms.concat([
          bool:
            should:
              disease_terms
            minimum_should_match: 1
        ])
        should: should_terms
        minimum_should_match: 1
  sort = {}
  if Session.get('sortBy') == 'date'
    sort = { 'meta.date': 'desc' }
  dateRange = {}
  if Session.get('fromDate')
    dateRange.from = Session.get('fromDate').toISOString()
  if Session.get('toDate')
    dateRange.to = Session.get('toDate').toISOString()
  doQuery({
    query:
      filtered:
        query: query
        filter:
          terms:
            'meta.country': CountriesSelected.find().map( (k)-> k.name )
          range:
            'meta.date': dateRange
    aggregations:
      countries:
        terms:
          field: 'meta.country'
      months:
        date_histogram:
          field: 'meta.date'
          interval: '1M'
    sort: sort
  })
)

Session.setDefault('useView', 'listView')
Template.search.useView = ()-> Session.get('useView')
Template.search.viewTypes = [
  {
    name: "listView"
    label: "List View"
  }, {
    name: "mapView"
    label: "Map View"
  }
]

Session.setDefault('sortBy', 'date')
Template.search.sortBy = ()-> Session.get('sortBy')
Template.search.sortMethods = [
  {
    name: "date"
    label: "Date"
  }, {
    name: "relevance"
    label: "Relevance"
  }
]

Template.search.searching = ()-> Session.get('searching')
Template.search.numResults = ()->
  if Session.get('searchResults') then Session.get('searchResults').length else 0
Template.search.totalResults = ()->
  if Session.get('totalResults') then Session.get('totalResults') else 0

Template.search.diseasesSelected = ()-> DiseasesSelected.find()
Template.search.anyKeywordsSelected = ()-> AnyKeywordsSelected.find()
Template.search.allKeywordsSelected = ()-> AllKeywordsSelected.find()
Template.search.countriesSelected = CountriesSelected

Template.search.aggregations = ()->
  console.log(Session.get('aggregations'))
  Session.get('aggregations')

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
      $("#new-disease").val('')
    else
      alert("You can only search for terms in the auto-complete menu.")

  "click .remove-disease" : (event) ->
    DiseasesSelected.remove({name : $(event.currentTarget).data('name')})

  "click #add-any-keyword" : (event) ->
    kwName = $("#new-any-keyword").val()
    AnyKeywordsSelected.insert({name : kwName})
    $("#new-any-keyword").val('')

  "click .remove-any-keyword" : (event) ->
    AnyKeywordsSelected.remove({name : $(event.currentTarget).data('name')})

  "click #add-all-keyword" : (event) ->
    kwName = $("#new-all-keyword").val()
    AllKeywordsSelected.insert({name : kwName})
    $("#new-all-keyword").val('')

  "click .remove-all-keyword" : (event) ->
    AllKeywordsSelected.remove({name : $(event.currentTarget).data('name')})

  "click .add-keyword-link" : (event) ->
    AllKeywordsSelected.insert({name : $(event.currentTarget).text()})

  "click .add-country-filter" : (event) ->
    CountriesSelected.insert({name : $(event.currentTarget).data('name')})

  "click .remove-country-filter" : (event) ->
    CountriesSelected.remove({name : $(event.currentTarget).data('name')})

  "change .from-date" : (event) ->
    date = new Date($(event.target).val())
    if date.toString() == "Invalid Date"
      date = null
    Session.set('fromDate', date)

  "change .to-date" : (event) ->
    date = new Date($(event.target).val())
    if date.toString() == "Invalid Date"
      date = null
    Session.set('toDate', date)

  "click .prev-page": (event) ->
    Session.set('page', Session.get('page') - 1)

  "change .next-page": (event) ->
    Session.set('page', Session.get('page') + 1)

  "change #sort-by": (event) ->
    Session.set('sortBy', $(event.target).val())

  "change #choose-view": (event) ->
    Session.set('useView', $(event.target).val())

Template.selector.itemsInCollection = ()-> this.collection.find()

Template.selector.events
  "click .add-item" : (event) ->
    console.log("Add")
    itemInput = $(event.target).parent().find('input')
    this.collection.insert({name : itemInput.val()})
    itemInput.val('')

  "click .remove-item" : (event, template) ->
    template.data.collection.remove({name : this.name})
