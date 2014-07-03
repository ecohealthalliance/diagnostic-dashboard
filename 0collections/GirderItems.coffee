@grits ?= {}
@grits.GirderItems = GirderItems = new Meteor.Collection('item')

if Meteor.isServer
  Meteor.publish('item', (query) ->
    if @userId
      GirderItems.find(query, {limit: 50})
  )
