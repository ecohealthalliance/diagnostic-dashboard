isntEmptyObjectOrArray = (x)->
  if _.isArray(x) or _.isObject(x)
    not _.isEmpty(x)
  else
    true

# Takes an array or object and recursively removes
# properties and items that are empty.
# E.g. empty values are removed, them values that only contained empty values
# are removed, and so on...
removeEmptyValues = (obj)->
  if _.isArray(obj)
    _.chain(obj).map(removeEmptyValues).filter(isntEmptyObjectOrArray).value()
  else if _.isObject(obj)
    _.chain(obj).map((val, key)->
      [key, removeEmptyValues(val)]
    ).filter((pair)->
      isntEmptyObjectOrArray(pair[1])
    ).object().value()
  else
    obj

doQuery = (query, options, callback) ->
  removeEmptyValues(query)
  Meteor.call('elasticsearch', query, options, (e,r) ->
    if e
      callback e
      return
    # It would be cool if we could highligh all the points for a given article 
    # when someone clicks one.
    Session.set('locations', _.chain(r.hits.hits).map((result) ->
      d = result._source
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
      ).flatten(true).filter((x)->x).value())

    callback e, r.hits.hits, r.hits.total, r.aggregations
  )

createQuery = (DiseasesSelected, AnyKeywordsSelected, AllKeywordsSelected) ->
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
  query

aggregationKeys = 
  'country': 'meta.country'
  'date': 'meta.date'

dateAggregationRanges = []
_.each(_.range(2010, 2016), (year) ->
  _.each(_.range(1, 13), (month) ->
    monthString = ("0" + month).substr(-2)
    prevYear = if month > 1 then year else year - 1
    prevMonth = if month > 1 then month - 1 else 12
    prevMonthString = ("0" + prevMonth).substr(-2)
    dateAggregationRanges.push {
      to: "#{monthString}-#{year}"
      from: "#{prevMonthString}-#{prevYear}"
    }
  )
)

@grits.controllers.search.createRoute('searchGirder', createQuery, doQuery, aggregationKeys, dateAggregationRanges)

Template.searchGirder.createQuery = () -> createQuery
Template.searchGirder.doQuery = () -> doQuery
Template.searchGirder.aggregationKeys = () -> aggregationKeys
Template.searchGirder.dateAggregationRanges = () -> dateAggregationRanges

Template.searchGirder.viewTypes = [
  {
    name: "listView"
    label: "List View"
  }, {
    name: "mapView"
    label: "Map View"
  }
]

Template.searchGirder.sortMethods = [
  {
    name: "dateAsc"
    label: "Oldest First"
  }, {
    name: "dateDesc"
    label: "Newest First"
  }, {
    name: "relevance"
    label: "Relevance"
  }
]
