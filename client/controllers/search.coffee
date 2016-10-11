DiseaseNames = () =>
  @grits.Girder.DiseaseNames

Keywords = () =>
  @grits.Girder.Keywords

RESULTS_PER_PAGE = 20


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
    dateRangeQuery = {}
    should_terms = countries.map((country) ->
      term = {
        fuzzy: {}
      }
      term.fuzzy[aggregationKeys.country] = {
        value: country
      }
      return term
    )
    if dateRange.from or dateRange.to
      range = {}
      range[aggregationKeys.date] = dateRange
      dateRangeQuery = {
        range: range
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

    unless _.isEmpty(query) and _.isEmpty(dateRangeQuery) and _.isEmpty(should_terms)
      fullQuery['query'] =
        filtered:
          query: query
          filter:
            "and": [
              dateRangeQuery,
              {
                fquery:
                  query:
                    bool:
                      should: should_terms
                      minimum_should_match: 1
              }
            ]
    doQuery(fullQuery, {
      size: RESULTS_PER_PAGE
      from: template.searchPage.get() * RESULTS_PER_PAGE
    })


Template.search.created = ->
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
  @sideBarOpen = new ReactiveVar true

  searchAutorun = createSearchAutorunFunction(
    this,
    createDoQueryFunction(this, @data.doQuery)
  )

  @searchAutorun = Deps.autorun(searchAutorun)

Template.search.helpers
  destroyed: ->
    @searchAutorun.stop()

  selections: ->
    Template.instance().selections

  eq: (a, b) ->
    a == b

  diseaseNames: ->
    DiseaseNames()

  keywords: ->
    Keywords()

  useView: ->
    Template.instance().useView.get()

  searching: ->
    Template.instance().searching.get()

  numResults: ->
    Template.instance().searchResults.get()?.length or 0

  totalResults: ->
    Template.instance().totalResults.get() or 0

  sortBy: ->
    Template.instance().sortBy.get()

  fromDate: ->
    Template.instance().fromDate

  toDate: ->
    Template.instance().toDate

  pageNum: ->
    Template.instance().searchPage.get() or 0

  resultListData: ->
    results: Template.instance().searchResults.get()
    AllKeywordsSelected: Template.instance().selections.AllKeywordsSelected

  aggregations: ->
    Template.instance().aggregations.get()

  formatDateRange: ->
    @dateRangeFormatter

  sideBarOpen: ->
    Template.instance().sideBarOpen.get()

Template.search.events
  'click .prev-page': (event, template) ->
    template.searchPage.set(Math.max(template.searchPage.get() - 1, 0))

  'click .next-page': (event, template) ->
    template.searchPage.set(
      Math.min(template.searchPage.get() + 1,
        Math.floor(template.totalResults.get() / RESULTS_PER_PAGE)
      )
    )

  'change #sort-by': (event, template) ->
    template.sortBy.set($(event.target).val())

  'change #choose-view': (event, template) ->
    template.useView.set($(event.target).val())


  'click .side-bar-toggle': (event, instance) ->
    event.stopPropagation()
    sideBarState = instance.sideBarOpen
    sideBarState.set not sideBarState.get()


Template.searchInput.helpers
  autocompleteSettings: ->
    position: "top"
    limit: 5
    rules: [
      {
        collection: @autocompleteCollection
        field: "_id"
        template: Template.searchPill
      }
    ]

  itemsSelected: ->
    @selected.find()

Template.searchInput.events
  'click .add-selection': (event, template) ->
    input = template.$('.add-selection-input')
    kwName = $(input).val()

    if (not template.data.restrictToAutocomplete) or template.data.autocompleteCollection.findOne({_id: kwName})
      template.data.selected.insert({value: kwName})
      $(input).val('')
    else
      alert("You can only search for terms in the auto-complete menu.")

  'click .remove-selection': (event, template) ->
    template.data.selected.remove({value: $(event.currentTarget).data('name')})


Template.searchAggregations.helpers
  percentage: (a,b) ->
    100 * a / b

  toDate:-> @toDate.get()?.toISOString().split('T')[0]

  fromDate:-> @fromDate.get()?.toISOString().split('T')[0]

Template.searchAggregations.events
  'click .add-country-filter': (event, template) ->
    template.data.selections.CountriesSelected.insert({name: $(event.currentTarget).data('name')})

  'click .remove-country-filter': (event, template) ->
    template.data.selections.CountriesSelected.remove({name: $(event.currentTarget).data('name')})

  'click .set-date': (event, template) ->
    fromDate = new Date(this.from)
    toDate = new Date(this.to)
    template.data.fromDate.set(fromDate)
    template.data.toDate.set(toDate)

  'change .from-date': (event, template) ->
    date = new Date($(event.target).val())
    if date.toString() == "Invalid Date"
      date = null
    template.data.fromDate.set(date)

  'change .to-date': (event, template) ->
    date = new Date($(event.target).val())
    if date.toString() == "Invalid Date"
      date = null
    template.data.toDate.set(date)


Template.selector.helpers
  itemsInCollection: -> this.collection.find()

Template.selector.events
  'click .add-selection': (event) ->
    itemInput = $(event.target).parent().find('input')
    this.collection.insert({name: itemInput.val()})
    itemInput.val('')

  'click .remove-selection': (event, template) ->
    template.data.collection.remove({name: this.name})
