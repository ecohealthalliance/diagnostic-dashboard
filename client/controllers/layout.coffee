Template.layout.isDashboard = () ->
  window.location.pathname.indexOf('dash') >= 0

Template.layout.signedIn = () ->
  Meteor.user()
