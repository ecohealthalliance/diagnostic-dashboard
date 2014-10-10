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
  console.log(keywordCounts)
  threashold = 2 #TODO This should be 1 S.D. below the mean
  return items.map((item)->
    if not item.meta.diagnosis.keywords_found
      item.distinctness = 0
      item.distinctKeywords = []
      return
    distinctKeywords = []
    item.meta.diagnosis.keywords_found.forEach((kw)->
      if keywordCounts[kw.name] <= threashold
        distinctKeywords.push(kw)
    )
    item.distinctness = distinctKeywords.length
    item.distinctKeywords = distinctKeywords
    return item
  )
Template.resultList.eq = (a, b) ->
  a == b
