# Temporary collections
CountriesSelected = new Meteor.Collection(null)

wrapDoQuery = (doQuery) ->
  (query, options, callback) ->
    aggregationsCallback = (e, results, total, aggregations) ->
      Session.set('aggregations', aggregations)
      callback e, results, total
    doQuery query, options, aggregationsCallback


wrapCreateQuery = (createQuery) ->
  (DiseasesSelected, AnyKeywordsSelected, AllKeywordsSelected) ->
    query = createQuery DiseasesSelected, AnyKeywordsSelected, AllKeywordsSelected

    sort = {}
    if Session.get('searchSortBy') == 'dateDesc'
      sort = { 'meta.date': 'desc' }
    else if Session.get('searchSortBy') == 'dateAsc'
      sort = { 'meta.date': 'asc' }
    dateRange = {}
    if Session.get('fromDate')
      dateRange.from = Session.get('fromDate').toISOString()
    if Session.get('toDate')
      dateRange.to = Session.get('toDate').toISOString()
    
    countries = CountriesSelected.find().map( (k)-> k.name )
    must_terms = []
    if countries.length > 0
      must_terms.push {
        terms:
          'meta.country': countries
      }
    if dateRange.from or dateRange.to
      must_terms.push {
        range:
          'meta.date': dateRange
      }

    return {
      query:
        filtered:
          query: query
          filter:
            bool:
              must: must_terms
      aggregations:
        countries:
          terms:
            field: 'meta.country'
        months:
          date_histogram:
            field: 'meta.date'
            interval: '1M'
      sort: [
        sort
        # Relevance score is used as a secondary criteria so it is always
        # computed and so that it can be a tie breaker for articles that happen
        # to occur at the same time.
        { "_score": { "order": "desc" }}
      ]
    }



@grits ?= {}
@grits.controllers ?= {}
@grits.controllers.searchAggregations ?= {}
@grits.controllers.searchAggregations.createRoute = (name, createQuery, doQuery) =>
  @grits.controllers.search.createRoute(name, wrapCreateQuery(createQuery), wrapDoQuery(doQuery))

Template.searchAggregations.timestampToMonthYear = (t) ->
  date = new Date(t)
  monthNames = "January,February,March,April,May,June,July,August,September,October,November,December".split(",")
  monthNames[date.getMonth()] + ' ' + date.getFullYear()

Template.searchAggregations.percentage = (a,b) ->
  100 * a / b

Template.searchAggregations.countriesSelected = CountriesSelected


Template.searchAggregations.toDate = ()-> Session.get('toDate')?.toISOString().split('T')[0]
Template.searchAggregations.fromDate = ()-> Session.get('fromDate')?.toISOString().split('T')[0]

Template.searchAggregations.aggregations = () ->
  Session.get('aggregations')

Template.searchAggregations.events
  "click .add-country-filter" : (event) ->
    CountriesSelected.insert({name : $(event.currentTarget).data('name')})

  "click .remove-country-filter" : (event) ->
    CountriesSelected.remove({name : $(event.currentTarget).data('name')})

  "click .set-month" : (event) ->
    fromDate = new Date(this.key)
    toDate = new Date(fromDate)
    toDate.setMonth(fromDate.getMonth() + 1)
    Session.set('fromDate', fromDate)
    Session.set('toDate', toDate)

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

Template.selector.itemsInCollection = ()-> this.collection.find()

Template.selector.events
  "click .add-item" : (event) ->
    itemInput = $(event.target).parent().find('input')
    this.collection.insert({name : itemInput.val()})
    itemInput.val('')

  "click .remove-item" : (event, template) ->
    template.data.collection.remove({name : this.name})