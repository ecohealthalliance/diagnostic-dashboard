doQuery = (query, options, callback) ->
  Meteor.call('gridsearch', query, options, (e,r) ->
    callback e, r.results, r.total
  )

createQuery = (DiseasesSelected, AnyKeywordsSelected, AllKeywordsSelected) ->
  categoryMap = {
    "eha/vector": "hostVal"
    "wordnet/hosts": "hostVal"
    "wordnet_hosts": "hostVal"
    "pm/vector": "hostVal"
    "biocaster/pathogens": "initiallyReportedPathogenNameVal"
    "hm/disease": "diseaseVal"
    "doid/diseases": "diseaseVal"
    "eha/disease": "diseaseVal"
    "wordnet/pathogens": "initiallyReportedPathogenNameVal"
    "wordnet_pathogens": "initiallyReportedPathogenNameVal"
    "pm_mode of transmission": "eventTransmissionVal"
    "pm/mode of transmission": "eventTransmissionVal"
    "eha/mode of transmission": "eventTransmissionVal"
    
    # probably not useful
    #"eha/description of infected": "occupationVal"
    #"wordnet/season": "startDateDescription"
    #"doid/located_in": "locationName"
    
    # lots of similar symptoms gives this too much weight
    #"eha/symptom": "reportedSymptomsVal"
    #"biocaster/symptoms": "reportedSymptomsVal" 
    #"doid/has_symptom": "reportedSymptomsVal"
    #"pm_symptom": "reportedSymptomsVal" 
    #"biocaster_symptoms": "reportedSymptomsVal"
    #"doid_has_symptom": "reportedSymptomsVal"
    #"pm/symptom": "reportedSymptomsVal"
  }

  disease_terms = DiseasesSelected.find().map (k)->
    "diseaseVal:\"#{k.name.toLowerCase()}\""

  should_terms = AnyKeywordsSelected.find().map (k)->
    name = k.name.toLowerCase()
    categories = @grits.Girder.Keywords.findOne({_id: name})?.value?.categories or []
    gridFields = _.uniq categories.map (category) ->
      categoryMap[category]
    gridFields = _.without gridFields, undefined
    terms = ("#{gridField}:\"#{name}\"" for gridField in gridFields)
    if _.isEmpty(terms)
      null
    else
      "(#{terms.join(" OR ")})"

  should_terms = should_terms.concat(disease_terms)
  should_terms = _.without should_terms, null

  must_terms = ["eidVal:1"]
  must_terms = must_terms.concat AllKeywordsSelected.find().map (k)->
    name = k.name.toLowerCase()
    categories = @grits.Girder.Keywords.findOne({_id: name})?.value?.categories
    gridFields = _.uniq categories.map (category) ->
      categoryMap[category]
    gridFields = _.without gridFields, undefined
    terms = ("#{gridField}:\"#{name}\"" for gridField in gridFields)
    if _.isEmpty(terms)
      null
    else
      "(#{terms.join(" OR ")})"
  must_terms = _.without must_terms, null
  
  query = ""
  if must_terms.length > 0
    query += "(#{must_terms.join(" AND ")})"
  if should_terms.length > 0
    if query.length > 0
      query += " AND "
    query += "(#{should_terms.join(" OR ")})"
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

