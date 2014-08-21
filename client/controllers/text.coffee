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

  console.log "Template.text.highlight features", features
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

Template.text.events(
  'mouseup': () ->
    console.log 'currentFeatures direct first', Session.get('features')
    selection = window.getSelection()
    if selection and selection.type is 'Range'
      console.log selection

    finalStopOffset = null
    finalStartOffset = null
    content = null

    if not selection.anchorNode.isSameNode(selection.focusNode)
        console.log "WHOA! we have a breaker"

    if $('#text').contents().length is 3
      finalStartOffset = selection.anchorOffset
      finalStopOffset = selection.focusOffset
      content = selection.baseNode.data
    else
      # Are there tags inside, turned on due to highlighting?
      startOffset = 0
      stopOffset = 0
      content = ''

      console.log "\n\n\nthere are tags"
      $('#text').contents().each (index, node) ->
        console.log "\n\nnode", node
        console.log "\n\nnode.data", node.data
        console.log "node.nodeType", node.nodeType
        textNode = node
        if node.nodeType == 1
          console.log 'is type 1'
          textNode = $(node).contents()[0]
        content += textNode.data
        if $(textNode).children().length > 0
          console.log 'node.children', $(node).children()
        if textNode.isSameNode(selection.anchorNode)
          console.log "this is the anchorNode, mane!"
          finalStartOffset = startOffset + selection.anchorOffset
        if textNode.isSameNode(selection.focusNode)
          console.log "this is the focusNode, mane!"
          finalStopOffset = stopOffset + selection.focusOffset
        else
          startOffset += textNode.data.length
          stopOffset += textNode.data.length
        console.log "node done:", textNode
        console.log "\n\n\n"
    selectedText = content.substring(finalStartOffset, finalStopOffset)
    console.log 'finalStartOffset', finalStartOffset
    console.log 'finalStopOffset', finalStopOffset
    console.log 'selectedText', selectedText
    Session.set('selectedText', selectedText)
    $('#annotation').show()
    console.log 'currentFeatures direct first', Session.get('features')
    currentFeatures = _.filter Session.get('features') or [], (feature) ->
      console.log 'filtering feature', feature
      console.log "'textOffsets' of feature", 'textOffsets' of feature
      console.log "feature.type is not 'adding'", feature.type != 'adding'
      ('textOffsets' of feature) and (feature.type != 'adding')
    console.log 'currentFeatures before', currentFeatures
    newFeature =
      value: selectedText
      type: 'adding'
      textOffsets: [[finalStartOffset, finalStopOffset]]
    console.log 'newFeature', newFeature
    currentFeatures.push newFeature
    console.log 'currentFeatures', currentFeatures
    Session.set('features', currentFeatures)
    console.log "Session.get('features')", Session.get('features')
)

Template.annotation.selectedText = () ->
  Session.get('selectedText')
