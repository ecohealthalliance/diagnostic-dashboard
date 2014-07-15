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
      # Remove any previous selections which could exist
      # if the user navigates away from the search page and comes back.
      DiseasesSelected.find({},{reactive:false}).forEach (d)->
        DiseasesSelected.remove(d._id)
      AnyKeywordsSelected.find({},{reactive:false}).forEach (k)->
        AnyKeywordsSelected.remove(k._id)
      if @params.diagnosisId
        diagnosis = Results.findOne(@params.diagnosisId)
        if diagnosis
          diagnosis.diseases.forEach (d)->
            DiseasesSelected.insert(d)
          diagnosis.keywords.forEach (k)->
            AnyKeywordsSelected.insert(k)
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
