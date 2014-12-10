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

  if features and content and (features instanceof Array)
    Template.dash.setActiveFeatureStyle()
    if features?.length > 0 and features[0].textOffsets
      # sort occurrences in descending order of start, so that we can add them
      # to the content string from end to beginning, so that offsets remain
      # valid.
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
        # Handlebars._escape is used to prevent formatting like <a@b.com>
        # from being injected as live html.
        highlightedContent += Handlebars._escape(content.substring(last_idx, occurrence[0]))
        if feature.feature.color
          bgColor = feature.feature.color
        else
          bgColor = color(feature.feature)
        highlightText = Handlebars._escape(content.substring(occurrence[0], occurrence[1]))
        highlightedContent += """<span
          class='label'
          style='
            background-color:#{bgColor};
            box-shadow: 0px 0px 0px 2px #{bgColor};
          '>#{highlightText}</span>"""
        last_idx = occurrence[1]
      highlightedContent += Handlebars._escape(content.substring(last_idx, content.length))
      return new Spacebars.SafeString(highlightedContent)
    else if features?.length > 0
      features = _.sortBy(features, (feature) -> (feature.name or feature.text).length)
      highlightedContent = Handlebars._escape(content)
      for feature in features
        featureDisplay = feature.name or feature.text
        bgColor = color(feature)
        # The escaping might break this regex.
        highlightedContent = highlightedContent.replace(
          new RegExp("\\b#{featureDisplay}\\b", 'gi'),
          "<span class='label' style='background-color:#{bgColor};" +
          "box-shadow: 0px 0px 0px 2px #{bgColor};'>$&</span>"
        )
      new Spacebars.SafeString(highlightedContent)
    else
      content
  else
    content
