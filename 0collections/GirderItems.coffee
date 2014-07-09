@grits ?= {}
@grits.GirderItems = GirderItems = new Meteor.Collection('item')

if Meteor.isServer
  Meteor.publish('item', (query) ->
    if @userId
      # The limit can cause seemingly inconsistent results where narrowing down
      # a queries causes articles to appear.
      GirderItems.find(query, {limit: 100})
  )
