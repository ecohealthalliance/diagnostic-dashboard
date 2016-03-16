Meteor.startup ->
  Meteor.call 'eidrUrl', (error, result) ->
    Session.set "eidrUrl", result

Template.registerHelper 'eidrUrl', () ->
  Session.get "eidrUrl"
