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

  @route("search",
    path: '/search'
    where: 'client'
    onBeforeAction: () ->
      AccountsEntry.signInRequired(@)
    waitOn: () ->
      #TODO Wait on all of these instead of just the last one
      Meteor.subscribe('diseaseNames')
      Meteor.subscribe('keywords')
      Meteor.subscribe('results')
    onAfterAction: ()->
      console.log @params.diagnosisId
      #Session.set("diagnosisId", @request.query.diagnosisId)
      if @params.diagnosisId
        diagnosis = Results.findOne(@params.diagnosisId)
        if diagnosis
          diagnosis.diseases.forEach (d)->
            DiseasesSelected.insert(d)
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
