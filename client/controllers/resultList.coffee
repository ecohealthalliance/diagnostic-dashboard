Template.resultList.results = () ->
  grits.Girder.Items.find()

Template.dash.eq = (a, b) ->
  a == b
