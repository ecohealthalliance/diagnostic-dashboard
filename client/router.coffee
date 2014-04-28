Results = @grits.Results


Router.configure
  layoutTemplate: "layout"


Router.map () ->

  @route("dash",
    path: '/dash/:_id'
    waitOn: () ->
      Meteor.subscribe('results')
    data: () ->
      Results.findOne(@params._id)
  )

  @route("submit")

  @route("home",
    path: "/"
    onAfterAction: () ->
      Router.go "submit"
  )
