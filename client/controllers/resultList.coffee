Template.resultList.results = () ->
  grits.GirderItems.find()

Template.dash.eq = (a, b) ->
  a == b
