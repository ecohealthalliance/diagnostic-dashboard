color = (text) =>
  @grits.services.color text

Template.text.highlight = (content) ->
  features = Session.get('features')
  features = _.sortBy(features, (feature) -> feature.length)
  if content and features?.length > 0
    highlightedContent = content
    for feature in features
      bgColor = color(feature)
      highlightedContent = highlightedContent.replace(new RegExp("\\b#{feature}\\b", 'gi'), "<span class='label' style='background-color:#{bgColor}'>$&</span>")
    new Spacebars.SafeString(highlightedContent)
  else
    content
