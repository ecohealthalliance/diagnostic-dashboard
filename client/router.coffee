Router.configure
  layoutTemplate: "layout"


Router.map () ->

  @route("dash",
    waitOn: () ->
      Meteor.subscribe('results')
  )

  @route("home",
    path: "/"
    onAfterAction: () ->
      Router.go "dash"
  )
