Results = @grits.Results


Router.configure
  layoutTemplate: "layout"


Router.map () ->

  @route("splash",
    path: '/'
    where: 'client'
    layoutTemplate: 'blank'
    onAfterAction: () ->
      userId = Meteor.userId()
      if userId
        Router.go "profile"
  )

  @route("profile",
    path: '/profile/:_id?'
    where: 'client'
    onBeforeAction: () ->
      AccountsEntry.signInRequired(@)
    waitOn: () ->
      if Meteor.userId()
        [
          Meteor.subscribe('users')
          Meteor.subscribe('results', {userId: (@params._id or Meteor.userId())})
        ]
    data: () ->
      userId = @params._id or Meteor.userId()
      {
        user: Meteor.users.findOne(userId)
        results: Results.find({userId: userId, ready: true, replacedBy: {'$exists': false}})
      }

  )

  @route("dash",
    path: '/dash/:_id'
    where: 'client'
    onBeforeAction: () ->
      AccountsEntry.signInRequired(@)
    waitOn: () ->
      if Meteor.userId()
        [
          Meteor.subscribe('item')
          Meteor.subscribe('feedback')
          Meteor.subscribe('results', {_id: @params._id})
        ]
    data: () ->
      data = Results.findOne(@params._id)
      if data?.prevDiagnosisId
        prevDiagnosis = Results.findOne(data.prevDiagnosisId)
        if prevDiagnosis?.error
          data.prevDiagnosisError = true

      # Set dates/locations session variables for visualizations
      features = data?.features or []
      Session.set('dates',
        _.chain(features)
          .where({type : 'datetime'})
          .map((feature) ->
            dateValue = new Date(feature.value)
            if dateValue.toString() != "Invalid Date"
              {
                date: dateValue
                latitude: null
                longitude: null
                location: null
              }
          ).filter(_.identity).value()
      )

      Session.set('locations',
        _.chain(features)
          .where({type : 'location'})
          .map((location) ->
            {
              date: null
              latitude: location.geoname.latitude
              longitude: location.geoname.longitude
              location: location.name
            }
          ).value()
      )

      return data
    onAfterAction: () ->
      try
        if typeof(@params.showKeypoints) != 'undefined'
          Session.set('showKeypoints', JSON.parse(@params.showKeypoints))
      catch
        alert('Invalid value for showKeypoints')
      result = @data()
      if result?.error and result?.updatedDiagnosisId
        Router.go "dash", {_id: result.updatedDiagnosisId}
    onStop: () ->
      Session.set('disease', null)
      Session.set('features', [])
      $('.popover').remove()
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

  @route("help",
    where: 'client'
  )
