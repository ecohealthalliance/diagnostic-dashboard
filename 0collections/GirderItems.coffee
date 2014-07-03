@grits ?= {}
@grits.GirderItems = GirderItems = new Meteor.Collection('item')

if Meteor.isServer
  Meteor.publish('item', (disease) ->
    if @userId
      GirderItems.find({'meta.diagnosis.diseases.name' : disease})
  )
