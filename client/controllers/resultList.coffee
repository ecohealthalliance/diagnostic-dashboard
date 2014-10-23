Template.resultList.results = () ->
  keywordCounts = {}
  items = Session.get('searchResults') or []
  items.forEach((item)->
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
  return items.map((item)->
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
    return item
  )
Template.resultList.eq = (a, b) ->
  a == b

Template.resultList.toDateString = (d)->
  (new Date(d)).toDateString()
