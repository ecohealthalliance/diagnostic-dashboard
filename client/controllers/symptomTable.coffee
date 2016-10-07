Template.symptomTable.symptomTableCollection = ()->
  if @diseases
    _.map @diseases, (disease)->
      diseaseClone = _.clone(disease)
      for kw in disease.keywords
        diseaseClone[kw.name] = kw.score
      diseaseClone

Template.symptomTable.tableSettings = () ->
  symptoms =
    _.chain(@diseases)
     .reduce( (sofar, disease) ->
         sofar.concat(_.pluck(disease.keywords, 'name'))
     , [])
     .uniq()
     .value()
  fields: [
    {
      key: 'name'
      label: 'Disease'
      fn: (value) ->
        Spacebars.SafeString "<span>#{value}</span>"
    },
  ].concat(_.map symptoms, (name)->
    {
      key: name
      label: name
      fn: (score) ->
        html = '<span>'
        _score = Math.round(score * 1000) / 1000
        html += "#{_score}</span>"
        Spacebars.SafeString html
    }
  )
  showNavigation: 'never'
  showFilter: false
