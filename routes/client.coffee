Results = @grits.Results


Router.configure
  layoutTemplate: "layout"


Router.map () ->

  @route("dash",
    path: '/dash/:_id'
    where: 'client'
    onBeforeAction: () ->
      AccountsEntry.signInRequired(@)
    waitOn: () ->
      Meteor.subscribe('results')
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

  @route("authenticateSubmission",
    path: '/authenticateSubmission/:_id'
    where: 'client'
    template: 'authenticateSubmission'
    onBeforeAction: () ->
      AccountsEntry.signInRequired(@)
    onAfterAction: () ->
      submissionId = @params._id
      Meteor.call('submitFromQuarantine', submissionId, (error, resultId) ->
        if resultId
          Router.go 'dash', {_id: resultId}
        else
          Router.go 'timeout'
      )
  )

  @route("timeout")

  @route("home",
    path: "/"
    where: 'client'
    onAfterAction: () ->
      Router.go "new"
  )
