doQuery = (query, options, callback) ->
  Meteor.call('gridsearch', query, options, (e,r) ->
    callback e, r.results, r.total
  )

createQuery = (DiseasesSelected, AnyKeywordsSelected, AllKeywordsSelected) ->
  disease_terms = DiseasesSelected.find().map (k)->
    "\"#{k.name.toLowerCase()}\""

  should_terms = AnyKeywordsSelected.find().map (k)->
    "\"#{k.name.toLowerCase()}\""
  should_terms.concat(disease_terms)

  must_terms = AllKeywordsSelected.find().map (k)->
    "\"#{k.name.toLowerCase()}\""

  query = ""
  if must_terms.length > 0
    query += must_terms.join(" AND ")
  if should_terms.length > 0
    if query.length > 0
      query += " OR "
    query += should_terms.join(" OR ")

  return query


@grits.controllers.search.createRoute('searchGrid', createQuery, doQuery)

Template.searchGrid.viewTypes = [
  {
    name: "listView"
    label: "List View"
  }
]

Template.searchGrid.sortMethods = [
  {
    name: "relevance"
    label: "Relevance"
  }
]

