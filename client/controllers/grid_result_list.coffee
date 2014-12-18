GRID_URL = ""
Meteor.call('gridUrl', (error, result) ->
  GRID_URL = result
)

Template.gridResultList.helpers
  'gridUrl': () ->
    GRID_URL