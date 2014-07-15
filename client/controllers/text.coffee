color = (text) =>
  @grits.services.color text

Template.text.highlight = (content) ->
  features = Session.get('features')
  # offset-based information for locations
  if features and content and (features instanceof Array)
    if features.length > 0 and features[0].occurrences
      # sort occurrences in descending order of start, so that we can add them
      # to the content string from end to beginning, so that offsets remain
      # valid.
      featuresByOccurrence = []
      for feature in features
        for occurrence in feature.occurrences
          featuresByOccurrence.push
            name: feature.name
            occurrence: occurrence
      featuresByOccurrence = _.sortBy(featuresByOccurrence, (feature) -> - feature.occurrence.start)
      highlightedContent = content
      for feature in featuresByOccurrence
        occurrence = feature.occurrence
        bgColor = color(feature.name)
        openSpan = "<span class='label' style='background-color:#{bgColor}'>"
        closeSpan = "</span>"
        highlightedContent = highlightedContent.substring(0, occurrence.start) +
          openSpan + highlightedContent.substring(occurrence.start, occurrence.end) +
          closeSpan + highlightedContent.substring(occurrence.end)
      new Spacebars.SafeString(highlightedContent)
    else if features?.length > 0
      features = _.sortBy(features, (feature) -> (feature.name or feature.text).length)
      highlightedContent = content
      for feature in features
        feature = feature.name or feature.text
        bgColor = color(feature)
        highlightedContent = highlightedContent.replace(new RegExp("\\b#{feature}\\b", 'gi'), "<span class='label' style='background-color:#{bgColor}'>$&</span>")
      new Spacebars.SafeString(highlightedContent)
    else
      content
  else
    content
