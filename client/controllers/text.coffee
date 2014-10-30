color = (feature) =>
  if feature.categories
    colorKey = feature.categories[0] + feature.name
  else if feature.type in ['caseCount', 'hospitalizationCount', 'deathCount', 'datetime', 'diseases', 'hosts', 'modes', 'pathogens', 'symptoms']
    colorKey =  feature.type + feature.value
  else if feature.type in ['location']
    colorKey = feature.type + feature.name
  else if feature.text
    colorKey = feature.text

  @grits.services.color colorKey

Template.text.highlight = (content) ->
  features = Session.get('features')
  # offset-based information for locations
  if features and content and (features instanceof Array)
    Template.dash.setActiveFeatureStyle()
    if features.length > 0
      featuresByOccurrence = []
      for feature in features
        for occurrence in feature.textOffsets
          featuresByOccurrence.push
            name: feature.name
            feature: feature
            occurrence: occurrence
      featuresByOccurrence = _.sortBy(featuresByOccurrence, (feature) -> feature.occurrence[0])
      highlightedContent = ''
      last_idx = 0
      for feature in featuresByOccurrence
        occurrence = feature.occurrence
        highlightedContent += content.substring(last_idx, occurrence[0])
        if feature.feature.color
          bgColor = feature.feature.color
        else
          bgColor = color(feature.feature)
        highlightText = content.substring(occurrence[0], occurrence[1])
        highlightedContent += """<span
          class='label'
          style='
            background-color:#{bgColor};
            box-shadow: 0px 0px 0px 2px #{bgColor};
          '>#{highlightText}</span>"""
        last_idx = occurrence[1]
      highlightedContent += content.substring(last_idx, content.length)
      return new Spacebars.SafeString(highlightedContent)
    else
      content
  else
    content
