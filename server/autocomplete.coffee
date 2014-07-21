Meteor.publish('keywords', (query) ->
  if @userId
    grits.Girder.Keywords.find({})
)

Meteor.publish('diseaseNames', (query) ->
  if @userId
    grits.Girder.DiseaseNames.find({})
)
