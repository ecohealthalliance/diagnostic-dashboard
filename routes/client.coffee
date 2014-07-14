Results = @grits.Results


Router.configure
  layoutTemplate: "layout"


Router.map () ->

  @route("profile",
    path: '/profile/:_id?'
    where: 'client'
    onBeforeAction: () ->
      AccountsEntry.signInRequired(@)
    waitOn: () ->
      Meteor.subscribe('users')
      Meteor.subscribe('results')
    data: () ->
      userId = @params._id or Meteor.userId()
      {
        user: Meteor.users.findOne(userId)
        results: Results.find({userId: userId, ready: true})
      }

  )

  @route("dash",
    path: '/dash/:_id'
    where: 'client'
    onBeforeAction: () ->
      AccountsEntry.signInRequired(@)
    waitOn: () ->
      Meteor.subscribe('results')
      Meteor.subscribe('girder')
    data: () ->
      Results.findOne(@params._id)
    onStop: () ->
      Session.set('disease', null)
      Session.set('features', [])
  )

  @route("symptomTable",
    path: '/symptomTable/:_id'
    where: 'client'
    onBeforeAction: () ->
      AccountsEntry.signInRequired(@)
    waitOn: () ->
      Meteor.subscribe('results')
    data: () ->
      Results.findOne(@params._id)
  )

  @route("new",
    where: 'client'
    onBeforeAction: () ->
      AccountsEntry.signInRequired(@)
  )

  @route("home",
    path: "/"
    where: 'client'
    onAfterAction: () ->
      Router.go "new"
  )
