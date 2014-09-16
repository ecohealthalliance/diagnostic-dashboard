Meteor.publish('keywords', (query) ->
  if @userId
    grits.Girder.Keywords.find({})
)

Meteor.publish('diseaseNames', (query) ->
  if @userId
    grits.Girder.DiseaseNames.find({})
)

Meteor.publish('diseases', (query) ->
  if @userId
    grits.Annotation.Diseases.find({})
)

Meteor.publish('hosts', (query) ->
  if @userId
    grits.Annotation.Hosts.find({})
)

Meteor.publish('symptoms', (query) ->
  if @userId
    grits.Annotation.Symptoms.find({})
)

Meteor.publish('annotationDiseases', (query) ->
  if @userId
    grits.Annotation.Diseases.find({})
)

Meteor.publish('pathogens', (query) ->
  if @userId
    grits.Annotation.Pathogens.find({})
)

Meteor.publish('modes', (query) ->
  if @userId
    grits.Annotation.Modes.find({})
)

Meteor.publish('geonames', (query) ->
  if @userId
    grits.Geonames.AllCountries.find({})
)
