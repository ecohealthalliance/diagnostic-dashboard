color = (feature) =>
  if feature.categories
    colorKey = feature.categories[0] + feature.name
  else if feature.type in ['caseCount', 'hospitalizationCount', 'deathCount', 'datetime']
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
    if features.length > 0 and features[0].textOffsets
      # sort occurrences in descending order of start, so that we can add them
      # to the content string from end to beginning, so that offsets remain
      # valid.
      featuresByOccurrence = []
      for feature in features
        for occurrence in feature.textOffsets
          newFeature = _.clone feature
          newFeature.occurrence = occurrence
          featuresByOccurrence.push newFeature
      featuresByOccurrence = _.sortBy(featuresByOccurrence, (feature) -> - feature.occurrence[0])
      highlightedContent = content
      for feature in featuresByOccurrence
        occurrence = feature.occurrence
        bgColor = color(feature)
        openSpan = "<span class='label' style='background-color:#{bgColor}; box-shadow: 0px 0px 0px 2px #{bgColor}'>"
        closeSpan = "</span>"
        highlightedContent = highlightedContent.substring(0, occurrence[0]) +
          openSpan + highlightedContent.substring(occurrence[0], occurrence[1]) +
          closeSpan + highlightedContent.substring(occurrence[1])
      new Spacebars.SafeString(highlightedContent)
    else if features?.length > 0
      features = _.sortBy(features, (feature) -> (feature.name or feature.text).length)
      highlightedContent = content
      for feature in features
        featureDisplay = feature.name or feature.text
        bgColor = color(feature)
        highlightedContent = highlightedContent.replace(new RegExp("\\b#{featureDisplay}\\b", 'gi'), "<span class='label' style='background-color:#{bgColor}; box-shadow: 0px 0px 0px 2px #{bgColor}'>$&</span>")
      new Spacebars.SafeString(highlightedContent)
    else
      content
  else
    content
