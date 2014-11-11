color = d3.scale.category20()

Template.symptomTable.eq = (a, b) ->
  a == b

Template.symptomTable.showCategory = (category) ->
  if category in ['datetime', 'caseCount', 'deathCount', 'hospitalizationCount', 'location']
    _.any(@features, (feature) ->
      feature.type is category
    )
  else
    _.any(@keywords, (keyword) ->
      _.any(keyword.categories, (keywordCategory) ->
        keywordCategory.indexOf(category) >= 0
      )
    )

Template.symptomTable.hasCategory = (keywordCategories, category) ->
  _.any(keywordCategories, (keywordCategory) ->
    keywordCategory.indexOf(category) >= 0
  )

Template.symptomTable.formatLocation = () ->
  location = "#{@name}"
  admin1Code = @['admin1 code'] # e.g., state
  location += ", #{admin1Code}" if admin1Code and /^[a-z]+$/i.test(admin1Code)
  countryCode = @['country code']
  location += ", #{countryCode}" if countryCode
  location

Template.symptomTable.formatDate = () ->
  date = new Date(@value)
  date.setDate(date.getDate() + 1)
  date.toLocaleDateString()

Template.symptomTable.color = () ->
  color @name

Template.symptomTable.selected = () ->
  @name == Session.get('disease')
  
Template.symptomTable.diagnosisId = () ->
  window.location.pathname.split('/').pop()

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
      key: 'probability'
      label: 'Probability'
      sort: -1
      fn: (prob) ->
        Math.round(prob * 1000) / 1000
    },
    {
      key: 'name'
      label: ' '
      fn: (name) ->
        if Session.equals('disease', name)
          Spacebars.SafeString '<span style="color: green">&#10004;</span>'
    },
    { key: 'name', label: 'Disease' },
    {
      key: 'keywords'
      label: 'Characteristics'
      fn: (features) ->
        html = ""
        _.each features, (feature) ->
          featureColor = color feature.name
          html += "<span style='background-color:#{featureColor}'>&nbsp;</span>&ensp;"
        Spacebars.SafeString html
    }
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


Template.symptomTable.events
  "click .pane:not(.maximized)": (event) ->
    selectedPane = $(event.currentTarget)
    selectedPane.hide()
    $('.pane').removeClass('maximized').addClass('minimized')
    selectedPane.removeClass('minimized').addClass('maximized')
    setHeights()
    selectedPane.fadeIn()

  "click .diagnosis .reactive-table tbody tr" : (event) ->
    Session.set('disease', @name)
    Session.set('features', keyword.name for keyword in @keywords)
