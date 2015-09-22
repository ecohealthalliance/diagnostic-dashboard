@grits ?= {}
@grits.services ?= {}
@grits.services.getIdKeyFromFeature = (feature) ->
  if feature.textOffsets
    # ids are generated from offsets so that features with content that appears
    # in mutiple places (e.g. counts) can be individually highlighted.
    return feature.type + '-o-' + feature.textOffsets.map((o)-> o[0] + '_' + o[1]).join('-')
  idKey = feature.name or feature.text or String(feature.value)
  idKey.replace(/[^A-Za-z0-9]/g, '_')
@grits.services.color = d3.scale.category20()

@grits.services.darken = (color, amt) ->

  if color[0] is "#" then color = color.slice(1)

  num = parseInt(color,16)

  r = (num >> 16) + amt

  if (r > 255)
    r = 255
  else if  (r < 0)
    r = 0

  b = ((num >> 8) & 0x00FF) + amt

  if (b > 255)
    b = 255
  else if  (b < 0)
    b = 0

  g = (num & 0x0000FF) + amt

  if (g > 255)
    g = 255
  else if (g < 0)
    g = 0

  "#"+(g | (b << 8) | (r << 16)).toString(16)
