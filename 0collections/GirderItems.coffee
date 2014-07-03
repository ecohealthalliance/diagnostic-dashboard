@grits ?= {}
@grits.GirderItems = GirderItems = new Meteor.Collection('item')

if Meteor.isServer
  Meteor.publish('item', () ->
    if @userId
      GirderItems.find()
  )
