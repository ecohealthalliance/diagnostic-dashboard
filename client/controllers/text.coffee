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
    else
      content
  else
    content

Template.text.events(
  'mouseup': () ->
    selection = window.getSelection()
    if selection and selection.type is 'Range'


      finalStopOffset = null
      finalStartOffset = null
      content = null

      if $('#text').contents().length is 3
        finalStartOffset = selection.anchorOffset
        finalStopOffset = selection.focusOffset
        content = selection.baseNode.data
      else
        # Are there tags inside, turned on due to highlighting?
        startOffset = 0
        stopOffset = 0
        content = ''

        $('#text').contents().each (index, node) ->

          textNode = node
          if node.nodeType == 1
            textNode = $(node).contents()[0]
          if textNode and textNode.data
            content += textNode.data
            if textNode.isSameNode(selection.anchorNode)
              finalStartOffset = startOffset + selection.anchorOffset
            if textNode.isSameNode(selection.focusNode)
              finalStopOffset = stopOffset + selection.focusOffset
            else
              startOffset += textNode.data.length
              stopOffset += textNode.data.length

      selectedText = content.substring(finalStartOffset, finalStopOffset)

      Session.set('selectedText', selectedText)
      $('#annotation').show()

      currentFeatures = _.filter Session.get('features') or [], (feature) ->

        ('textOffsets' of feature) and (feature.type != 'adding')

      newFeature =
        value: selectedText
        type: 'adding'
        textOffsets: [[finalStartOffset, finalStopOffset]]

      currentFeatures.push newFeature

      Session.set 'features', currentFeatures

      parsedNumber = parseInt selectedText

      # If there is a number parseable from the selected text, save that value
      # so we can present it to the user if they select one of the count types.

      if not isNaN(parsedNumber)
        $('#annotationType').val('caseCount')
        Session.set 'annotationType', 'caseCount'
        setTimeout ( ->
          $('#caseCountValue').val(parsedNumber)
          $('#deathCountValue').val(parsedNumber)
          $('#hospitalizationCountValue').val(parsedNumber)
        ), 100

      lcSelection = selectedText.toLowerCase()

      diseaseResult = grits.Annotation.Diseases.findOne({_id: lcSelection})
      if diseaseResult
        Session.set 'annotationType', 'disease'
        $('#annotationType').val 'disease'
        setTimeout ( ->
          $('#diseaseValue').val diseaseResult._id
        ), 100

      hostResult = grits.Annotation.Hosts.findOne({_id: lcSelection})
      if hostResult
        Session.set('annotationType', 'host')
        $('#annotationType').val('host')
        setTimeout ( ->
          $('#hostValue').val hostResult._id
        ), 100

      symptomResult = grits.Annotation.Symptoms.findOne({_id: lcSelection})
      if symptomResult
        Session.set('annotationType', 'symptom')
        $('#annotationType').val('symptom')
        setTimeout ( ->
          $('#symptomValue').val symptomResult._id
        ), 100

      pathogenResult = grits.Annotation.Pathogens.findOne({_id: lcSelection})
      if pathogenResult
        Session.set('annotationType', 'pathogen')
        $('#annotationType').val('pathogen')
        setTimeout ( ->
          $('#pathogenValue').val pathogenResult._id
        ), 100

      modeResult = grits.Annotation.Modes.findOne({_id: lcSelection})
      if modeResult
        Session.set('annotationType', 'mode')
        $('#annotationType').val('mode')
        setTimeout ( ->
          $('#modeValue').val modeResult._id
        ), 100

)


