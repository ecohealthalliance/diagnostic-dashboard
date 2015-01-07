DiagnosisResults = () =>
  @grits.Results

doQuery = (query, options, callback) ->
  Meteor.call('gridsearch', query, options, (e,r) ->
    callback e, r?.results, r?.total, r?.aggregations
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
    fuzzy_like_this:
      fields: ['diseaseVal']
      like_text: k.value.toLowerCase()

  should_terms = AnyKeywordsSelected.find().map (k)->
    name = k.value.toLowerCase()
    categories = @grits.Girder.Keywords.findOne({_id: name})?.value?.categories or []
    gridFields = _.uniq categories.map (category) ->
      categoryMap[category]
    gridFields = _.without gridFields, undefined
    if _.isEmpty(gridFields)
      null
    else
      fuzzy_like_this:
        fields: gridFields
        like_text: name

  should_terms = should_terms.concat(disease_terms)
  should_terms = _.without should_terms, null

  must_terms = [
    match_phrase:
      eidVal: 1
  ]
  must_terms = must_terms.concat AllKeywordsSelected.find().map (k)->
    name = k.value.toLowerCase()
    categories = @grits.Girder.Keywords.findOne({_id: name})?.value?.categories
    gridFields = _.uniq categories.map (category) ->
      categoryMap[category]
    gridFields = _.without gridFields, undefined
    if _.isEmpty(gridFields)
      null
    else
      fuzzy_like_this:
        fields: gridFields
        like_text: name
  must_terms = _.without must_terms, null

  query = {}
  if [].concat(should_terms, must_terms).length > 0
    query =
      bool:
        must: must_terms
        should: should_terms
        minimum_should_match: 1
  query

aggregationKeys =
  'country': 'locationNation'
  'date': 'startDateISO'

dateAggregationRanges = []
_.each(_.range(1930, 2030, 10), (year) ->
  date = new Date(year, 11, 31)
  prevDate = new Date(year - 10, 11, 31)
  dateAggregationRanges.push {
    to: date.getTime()
    from: prevDate.getTime()
  }
)

formatDateRange = (from, to) ->
  (new Date(from)).getFullYear() + 1 + "-" + (new Date(to)).getFullYear()

viewTypes = [
  {
    name: "listView"
    label: "List View"
  }
]

sortMethods = [
  {
    name: "relevance"
    label: "Relevance"
  }
]

Router.route("searchGrid",
  where: "client"
  path: "/searchGrid"
  template: "search"
  onBeforeAction: () ->
    AccountsEntry.signInRequired(@)
  waitOn: () ->
    if Meteor.userId()
      [
        Meteor.subscribe('diseaseNames')
        Meteor.subscribe('keywords')
        Meteor.subscribe('results', {_id: @params.query.diagnosisId})
      ]
  data: () ->
    diagnosis = DiagnosisResults().findOne(@params.query.diagnosisId)
    {
      label: "historic events"
      diagnosis: diagnosis
      createQuery: createQuery
      doQuery: doQuery
      aggregationKeys: aggregationKeys
      dateAggregationRanges: dateAggregationRanges
      viewTypes: viewTypes
      sortMethods: sortMethods
      resultListTemplate: "gridResultList"
      formatDateRange: formatDateRange
    }
  onStop: () ->
    $('.popover').remove()
)
