Template.resultList.results = () ->
  grits.Girder.Items.find()

Template.resultList.eq = (a, b) ->
  a == b
