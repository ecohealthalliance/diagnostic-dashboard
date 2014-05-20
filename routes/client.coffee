Results = @grits.Results


Router.configure
  layoutTemplate: "layout"


Router.map () ->

  @route("dash",
    path: '/dash/:_id'
    where: 'client'
    waitOn: () ->
      Meteor.subscribe('results')
    data: () ->
      Results.findOne(@params._id)
  )
  
  @route("symptomTable",
    path: '/symptomTable/:_id'
    where: 'client'
    waitOn: () ->
      Meteor.subscribe('results')
    data: () ->
      Results.findOne(@params._id)
  )

  @route("new",
    where: 'client'
  )

  @route("home",
    path: "/"
    where: 'client'
    onAfterAction: () ->
      Router.go "new"
  )
