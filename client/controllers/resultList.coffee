# Convert array of numbers into a string describing the range of values in it.
rangeString = (arr)->
  if not _.isEmpty(arr)
    min = _.min(arr)
    max = _.max(arr)
    if min == max
      return "" + min
    else
      return min + " to " + max

Template.resultList.results = () ->
  keywordCounts = {}
  searchResults = @results or []
  searchResults.forEach((result)->
    item = result._source
    if not item.meta.diagnosis?.keywords_found
      return
    item.meta.diagnosis.keywords_found.forEach((kw)->
      if !keywordCounts[kw.name]
        keywordCounts[kw.name] = 0
      keywordCounts[kw.name] += 1
    )
  )
  countValues = _.values(keywordCounts)
  meanCount = _.reduce(countValues, ((sofar, val)->
    return sofar + val
  ), 0) / countValues.length
  standardDeviation = Math.sqrt(_.reduce(countValues, ((sofar, val)->
    difference = val - meanCount
    return sofar + (difference * difference)
  ), 0) / countValues.length)
  threashold = Math.max(1, meanCount - standardDeviation)
  return searchResults.map((result)->
    item = result._source
    item.searchScore = result._score
    if not item.meta.diagnosis?.keywords_found
      item.distinctness = 0
      item.distinctKeywords = []
      return item
    distinctKeywords = []
    item.meta.diagnosis.keywords_found.forEach((kw)->
      if keywordCounts[kw.name] <= threashold
        distinctKeywords.push(kw)
    )
    distinctKeywords = _.sortBy(distinctKeywords, (kw)-> keywordCounts[kw])
    item.distinctness = distinctKeywords.length
    item.distinctKeywords = distinctKeywords
    # Create and attach an object that summarizes all the countes in the article.
    counts = 
      cases : rangeString(_.chain(item.meta.diagnosis.features)
        .where({type : "caseCount"})
        .pluck("value")
        .value())
      deaths : rangeString(_.chain(item.meta.diagnosis.features)
        .where({type : "deathCount"})
        .pluck("value")
        .value())
      hospitalizations : rangeString(_.chain(item.meta.diagnosis.features)
        .where({type : "hospitalizationCount"})
        .pluck("value")
        .value())
    if _.any(counts)
      item.counts = counts
    return item
  )
Template.resultList.eq = (a, b) ->
  a == b

Template.resultList.toDateString = (d)->
  (new Date(d)).toDateString()
