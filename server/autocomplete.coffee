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

Meteor.publish 'geonames', (selector, options, collName) ->

  collection = grits.Geonames.AllCountries

  unless collection
    throw new Error(collName + ' is not defined on the global namespace of the server.')

  sub = this

  # guard against client-side DOS: hard limit to 50
  options.limit = Math.min(50, Math.abs(options.limit)) if options.limit

  # Push this into our own collection on the client so they don't interfere with other publications of the named collection.
  handle = collection.find(selector, options).observeChanges
    added: (id, fields) ->
      sub.added('autocompleteRecords', id, fields)
    changed: (id, fields) ->
      sub.changed('autocompleteRecords', id, fields)
    removed: (id) ->
      sub.removed('autocompleteRecords', id)

  sub.ready()
  sub.onStop -> handle.stop()