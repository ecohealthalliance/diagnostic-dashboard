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
    { key: 'name', label: 'Disease' },
  ].concat(_.map symptoms, (name)->
    {
      key: name
      label: name
      fn: (score) ->
        Math.round(score * 1000) / 1000
    }
  )
  showNavigation: 'never'
  showFilter: false
