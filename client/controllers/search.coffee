DiseaseNames = () =>
  @grits.Girder.DiseaseNames

Keywords = () =>
  @grits.Girder.Keywords

RESULTS_PER_PAGE = 10


createDoQueryFunction = (template, doQuery) ->
  _.debounce(((query, options) ->
    template.searching.set(true)
    callback = (error, results, total, aggregations) ->
      if error
        console.error error
        template.searching.set(false)
        return
      template.searching.set(false)
      template.searchResults.set(results)
      template.totalResults.set(total)
      template.aggregations.set(aggregations)
    doQuery(query, options, callback)
  ), 1000)

createSearchAutorunFunction = (template, doQuery) ->
  lastPage = null
  template.searchPage.set(0)
  return () ->
    # If the page did not change that means something else did
    # so we should reset the page.
    if template.searchPage.get() == lastPage
      template.searchPage.set(0)
    else
      lastPage = template.searchPage.get()

    selections = template.selections
    createQuery = template.data.createQuery
    aggregationKeys = template.data.aggregationKeys
    dateAggregationRanges = template.data.dateAggregationRanges

    query = createQuery(selections.DiseasesSelected, selections.AnyKeywordsSelected, selections.AllKeywordsSelected)

    sort = {}
    if template.sortBy.get() == 'dateDesc'
      sort = { 'meta.date': 'desc' }
    else if template.sortBy.get() == 'dateAsc'
      sort = { 'meta.date': 'asc' }
    dateRange = {}
    if template.fromDate.get()
      dateRange.from = template.fromDate.get().toISOString()
    if template.toDate.get()
      dateRange.to = template.toDate.get().toISOString()
    
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
      from: template.searchPage.get() * RESULTS_PER_PAGE
    })


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
      selections.DiseasesSelected.insert({value: d.name})
    if diagnosis.features
      diagnosis.features.forEach (k)->
        if k.type in ['symptoms', 'pathogens', 'diseases', 'hosts', 'modes']
          selections.AnyKeywordsSelected.insert(k)

  @useView = new ReactiveVar(@data.viewTypes?[0].name or 'listView')
  @sortBy = new ReactiveVar(@data.sortMethods?[0].name or 'relevance')
  @fromDate = new ReactiveVar()
  @toDate = new ReactiveVar()
  @searchPage = new ReactiveVar(0)
  @searching = new ReactiveVar(false)
  @searchResults = new ReactiveVar([])
  @totalResults = new ReactiveVar(0)
  @aggregations = new ReactiveVar([])

  searchAutorun = createSearchAutorunFunction(
    this,
    createDoQueryFunction(this, @data.doQuery)
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

Template.search.useView = () ->
  Template.instance().useView.get()

Template.search.searching = () ->
  Template.instance().searching.get()

Template.search.numResults = () -> 
  Template.instance().searchResults.get()?.length or 0

Template.search.totalResults = () ->
  Template.instance().totalResults.get() or 0

Template.search.sortBy = () ->
  Template.instance().sortBy.get()

Template.search.fromDate = () ->
  Template.instance().fromDate

Template.search.toDate = () ->
  Template.instance().toDate

Template.search.pageNum = () ->
  Template.instance().searchPage.get() or 0

Template.search.resultListData = () ->
  results: Template.instance().searchResults.get()

Template.search.aggregations = () ->
  Template.instance().aggregations.get()

Template.search.formatDateRange = () ->
  @formatDateRange


Template.searchInput.events
  "click .add-selection" : (event, template) ->
    input = $(event.target).siblings('.add-selection-input')
    kwName = $(input).val()
    
    if (not template.data.restrictToAutocomplete) or template.data.autocompleteCollection.findOne({_id : kwName})
      template.data.selected.insert({value : kwName})
      $(input).val('')
    else
      alert("You can only search for terms in the auto-complete menu.")

  "click .remove-selection" : (event, template) ->
    template.data.selected.remove({value : $(event.currentTarget).data('name')})

Template.search.events
  "click .prev-page": (event, template) ->
    template.searchPage.set(Math.max(template.searchPage.get() - 1, 0))
    
  "click .next-page": (event, template) ->
    template.searchPage.set(
      Math.min(template.searchPage.get() + 1,
        Math.floor(template.totalResults.get() / RESULTS_PER_PAGE)
      )
    )

  "change #sort-by": (event, template) ->
    template.sortBy.set($(event.target).val())

  "change #choose-view": (event, template) ->
    template.useView.set($(event.target).val())


Template.searchAggregations.percentage = (a,b) ->
  100 * a / b

Template.searchAggregations.toDate = ()-> @toDate.get()?.toISOString().split('T')[0]
Template.searchAggregations.fromDate = ()-> @fromDate.get()?.toISOString().split('T')[0]

Template.searchAggregations.events
  "click .add-country-filter" : (event, template) ->
    template.data.selections.CountriesSelected.insert({name : $(event.currentTarget).data('name')})

  "click .remove-country-filter" : (event, template) ->
    template.data.selections.CountriesSelected.remove({name : $(event.currentTarget).data('name')})

  "click .set-date" : (event, template) ->
    fromDate = new Date(this.from)
    toDate = new Date(this.to)
    template.data.fromDate.set(fromDate)
    template.data.toDate.set(toDate)

  "change .from-date" : (event, template) ->
    date = new Date($(event.target).val())
    if date.toString() == "Invalid Date"
      date = null
    template.data.fromDate.set(date)

  "change .to-date" : (event, template) ->
    date = new Date($(event.target).val())
    if date.toString() == "Invalid Date"
      date = null
    template.data.toDate.set(date)

Template.selector.itemsInCollection = ()-> this.collection.find()

Template.selector.events
  "click .add-item" : (event) ->
    itemInput = $(event.target).parent().find('input')
    this.collection.insert({name : itemInput.val()})
    itemInput.val('')

  "click .remove-item" : (event, template) ->
    template.data.collection.remove({name : this.name})