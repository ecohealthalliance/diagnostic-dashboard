DiagnosisResults = () =>
  @grits.Results

DiseaseNames = () =>
  @grits.Girder.DiseaseNames

Keywords = () =>
  @grits.Girder.Keywords

RESULTS_PER_PAGE = 10


createDoQueryFunction = (doQuery) ->
  _.debounce(((query, options) ->
    Session.set('searching', true)
    callback = (error, results, total, aggregations) ->
      if error
        console.error error
        Session.set('searching', false)
        return
      Session.set('searching', false)
      Session.set('searchResults', results)
      Session.set('totalResults', total)
      Session.set('aggregations', aggregations)
    doQuery(query, options, callback)
  ), 1000)

createSearchAutorunFunction = (selections, createQuery, doQuery, aggregationKeys, dateAggregationRanges) ->
  lastPage = null
  Session.set('searchPage', 0)
  return () ->
    # If the page did not change that means something else did
    # so we should reset the page.
    if Session.get('searchPage') == lastPage
      Session.set('searchPage', 0)
    else
      lastPage = Session.get('searchPage')

    query = createQuery(selections.DiseasesSelected, selections.AnyKeywordsSelected, selections.AllKeywordsSelected)

    sort = {}
    if Session.get('searchSortBy') == 'dateDesc'
      sort = { 'meta.date': 'desc' }
    else if Session.get('searchSortBy') == 'dateAsc'
      sort = { 'meta.date': 'asc' }
    dateRange = {}
    if Session.get('searchFromDate')
      dateRange.from = Session.get('searchFromDate').toISOString()
    if Session.get('searchToDate')
      dateRange.to = Session.get('searchToDate').toISOString()
    
    countries = selections.CountriesSelected.find().map( (k)-> k.name )
    must_terms = []
    if countries.length > 0
      terms = {}
      terms[aggregationKeys.country] = countries
      must_terms.push {
        terms: terms
      }
    if dateRange.from or dateRange.to
      terms = {}
      terms[aggregationKeys.date] = dateRange
      must_terms.push {
        range: terms
      }

    fullQuery = {
      aggregations:
        countries:
          terms:
            field: aggregationKeys.country
        dates:
          date_range:
            field: aggregationKeys.date
            format: 'MM-yyyy'
            ranges: dateAggregationRanges

      sort: [
        sort
        # Relevance score is used as a secondary criteria so it is always
        # computed and so that it can be a tie breaker for articles that happen
        # to occur at the same time.
        { "_score": { "order": "desc" }}
      ]
    }

    unless _.isEmpty(query) and _.isEmpty(must_terms)
      fullQuery['query'] =
        filtered:
          query: query
          filter:
            bool:
              must: must_terms

    fullQuery

    doQuery(fullQuery, {
      size: RESULTS_PER_PAGE
      from: Session.get('searchPage') * RESULTS_PER_PAGE
    })

@grits ?= {}
@grits.controllers ?= {}
@grits.controllers.search ?= {}
@grits.controllers.search.createRoute = (name, createQuery, doQuery, aggregationKeys, dateAggregationRanges) ->
  Router.route(name,
    path: "/#{name}"
    where: "client"
    onBeforeAction: () ->
      AccountsEntry.signInRequired(@)
    data: () ->
      diagnosis = DiagnosisResults().findOne(@params.query.diagnosisId)
      { 
        diagnosis: diagnosis
      }
    waitOn: () ->
      [
        Meteor.subscribe('diseaseNames')
        Meteor.subscribe('keywords')
        Meteor.subscribe('results', {_id: @params.query.diagnosisId})
      ]
    onAfterAction: () ->
      # Remove any previous selections which could exist
      # if the user navigates away from the search page and comes back.
      Session.set('searchView', 'listView')
      Session.set('searchSortBy', 'relevance')
      Session.set('searchFromDate', null)
      Session.set('searchToDate', null)
      Session.set('searchResults', [])
      Session.set('totalResults', 0)
      Session.set('aggregations', [])
    onStop: () ->
      $('.popover').remove()
  )


Template.search.created = () ->
  # Temporary collections
  DiseasesSelected = new Meteor.Collection(null)
  AnyKeywordsSelected = new Meteor.Collection(null)
  AllKeywordsSelected = new Meteor.Collection(null)
  CountriesSelected = new Meteor.Collection(null)

  @selections = {
    DiseasesSelected: DiseasesSelected
    AnyKeywordsSelected: AnyKeywordsSelected
    AllKeywordsSelected: AllKeywordsSelected
    CountriesSelected: CountriesSelected
  }
  
  selections = @selections
  diagnosis = @data.diagnosis

  if diagnosis
    diagnosis.diseases.forEach (d)->
      selections.DiseasesSelected.insert(d)
    if diagnosis.keywords
      diagnosis.keywords.forEach (k)->
        selections.AnyKeywordsSelected.insert(k)

  searchAutorun = createSearchAutorunFunction(
    selections,
    @data.createQuery, 
    createDoQueryFunction(@data.doQuery),
    @data.aggregationKeys,
    @data.dateAggregationRanges
  )

  @searchAutorun = Deps.autorun(searchAutorun)


Template.search.destroyed = () ->
  @searchAutorun.stop()

Template.search.selections = () ->
  Template.instance().selections

Template.searchInput.autocompleteSettings = () ->
  position: "top"
  limit: 5
  rules: [
    {
      collection: @autocompleteCollection
      field: "_id"
      template: Template.searchPill
    }
  ]

Template.searchInput.itemsSelected = () ->
  @selected.find()

Template.search.eq = (a, b) ->
  a == b

Template.search.diseaseNames = () ->
  DiseaseNames()

Template.search.keywords = () ->
  Keywords()

Template.search.useView = (viewTypes) ->
  Session.get('searchView')

Template.search.searching = () -> Session.get('searching')

Template.search.numResults = () -> 
  Session.get('searchResults')?.length or 0

Template.search.totalResults = () ->
  Session.get('totalResults') or 0

Template.search.sortBy = (sortMethods) ->
  Session.get('searchSortBy')

Template.search.pageNum = () ->
  Session.get('searchPage') or 0

Template.search.results = () ->
  Session.get('searchResults')


Template.searchInput.events
  "click .add-selection" : (event, template) ->
    input = $(event.target).siblings('.add-selection-input')
    kwName = $(input).val()
    
    if (not template.data.restrictToAutocomplete) or template.data.autocompleteCollection.findOne({_id : kwName})
      template.data.selected.insert({name : kwName})
      $(input).val('')
    else
      alert("You can only search for terms in the auto-complete menu.")

  "click .remove-selection" : (event, template) ->
    template.data.selected.remove({name : $(event.currentTarget).data('name')})

Template.search.events
  "click .prev-page": (event) ->
    Session.set('searchPage', Math.max(Session.get('searchPage') - 1, 0))

  "click .next-page": (event) ->
    Session.set('searchPage',
      Math.min(Session.get('searchPage') + 1,
        Math.floor(Session.get('totalResults') / RESULTS_PER_PAGE)
      )
    )

  "change #sort-by": (event) ->
    Session.set('searchSortBy', $(event.target).val())

  "change #choose-view": (event) ->
    Session.set('searchView', $(event.target).val())


Template.searchAggregations.timestampToMonthYear = (from, to) ->
  fromDate = new Date(from)
  toDate = new Date(to)
  if toDate.getTime() - fromDate.getTime() < 5000000000
    monthNames = "January,February,March,April,May,June,July,August,September,October,November,December".split(",")
    return monthNames[toDate.getMonth()] + ' ' + toDate.getFullYear()
  else
    return fromDate.getFullYear() + 1 + "-" + toDate.getFullYear()

Template.searchAggregations.percentage = (a,b) ->
  100 * a / b

Template.searchAggregations.toDate = ()-> Session.get('searchToDate')?.toISOString().split('T')[0]
Template.searchAggregations.fromDate = ()-> Session.get('searchFromDate')?.toISOString().split('T')[0]

Template.searchAggregations.aggregations = () ->
  Session.get('aggregations')

Template.searchAggregations.events
  "click .add-country-filter" : (event, template) ->
    template.data.selections.CountriesSelected.insert({name : $(event.currentTarget).data('name')})

  "click .remove-country-filter" : (event, template) ->
    template.data.selections.CountriesSelected.remove({name : $(event.currentTarget).data('name')})

  "click .set-month" : (event) ->
    fromDate = new Date(this.from)
    toDate = new Date(this.to)
    Session.set('searchFromDate', fromDate)
    Session.set('searchToDate', toDate)

  "change .from-date" : (event) ->
    date = new Date($(event.target).val())
    if date.toString() == "Invalid Date"
      date = null
    Session.set('searchFromDate', date)

  "change .to-date" : (event) ->
    date = new Date($(event.target).val())
    if date.toString() == "Invalid Date"
      date = null
    Session.set('searchToDate', date)

Template.selector.itemsInCollection = ()-> this.collection.find()

Template.selector.events
  "click .add-item" : (event) ->
    itemInput = $(event.target).parent().find('input')
    this.collection.insert({name : itemInput.val()})
    itemInput.val('')

  "click .remove-item" : (event, template) ->
    template.data.collection.remove({name : this.name})