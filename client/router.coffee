Results = @grits.Results


Router.configure
  layoutTemplate: "layout"


Router.map () ->

  @route("dash",
    waitOn: () ->
      Meteor.subscribe('results')
    data: () ->
      Results.findOne()
  )

  @route("home",
    path: "/"
    onAfterAction: () ->
      Router.go "dash"
  )
