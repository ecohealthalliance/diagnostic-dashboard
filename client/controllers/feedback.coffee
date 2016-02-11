if Meteor.isClient
  Template.feedback.created = ->
    @missingDiseases = new Meteor.Collection(null)
    @feedbackId = new ReactiveVar(null)
    @addDiseaseEnabled = new ReactiveVar(false)

    feedbackBaseData =
      userId: Meteor.userId()
      diagnosisId: @._id

    storedFeedback = grits.feedback.findOne(feedbackBaseData)
    # Dynamically load disease names for the autocomplete
    Meteor.subscribe('diseaseNames')
    # Clear the missing diseases collection
    @missingDiseases.find().fetch().forEach((d)->
      @missingDiseases.remove(d._id)
    )
    if storedFeedback
      @feedbackId.set(storedFeedback._id)
      # Repopulate feedback form so users can edit it later
      $('[name="comments"]').val(storedFeedback.comments)
      $('[name="general_comments"]').val(storedFeedback.generalComments)
      storedFeedback.correctDiseases?.forEach((d)->
        $('[name="' + d + '-correct"][value=true]').prop('checked', true)
      )
      storedFeedback.incorrectDiseases?.forEach((d)->
        $('[name="' + d + '-correct"][value=false]').prop('checked', true)
      )
      storedFeedback.missingDiseases?.forEach (d)->
        missingDiseases.insert(name : d)

    else
      @feedbackId.set grits.feedback.insert(_.extend({created: new Date()}, feedbackBaseData))


  Template.feedback.helpers
    missingDiseases: ->
      Template.instance().missingDiseases.find()

    diseaseCompleteSettings: ->
      position: "bottom",
      limit: 5,
      rules: [
        {
          collection: grits.Girder.DiseaseNames,
          field: "_id",
          template: Template.autocompletePill
        },
      ]

    addDiseaseEnabled: ->
      Template.instance().addDiseaseEnabled.get()

  Template.feedback.events
    "submit .feedback": (event, instance) ->
      event.preventDefault()
      form = $(event.target).serializeArray()
      parseDisease = (f)->
          diseaseMatch = f.name.match(/(.*)-correct/)
          if diseaseMatch then diseaseMatch[1] else false
      feedbackItem =
        diagnosisId : @._id
        version: "0.1.1"
        lastModified: new Date()
        comments : _.findWhere(form, name : 'comments').value
        generalComments : _.findWhere(form, name : 'general_comments').value
        correctDiseases : _.chain(form)
          .where(value : "true")
          .map(parseDisease)
          .compact()
          .value()
        incorrectDiseases : _.chain(form)
          .where(value : "false")
          .map(parseDisease)
          .compact()
          .value()
        missingDiseases : instance.missingDiseases.find().map((x)->x.name)

      Meteor.call 'submitFeedback', instance.feedbackId.get(), feedbackItem, (error, response) ->
        if error
          throw new Meteor.Error error.reason
        else
          event.target.reset()
          $('#feedback-modal').modal('hide')

    "click .close-feedback": (event, instance) ->
      $('#feedback-modal').modal('hide')

    "input #new-disease" : (event, instance) ->
      enababled = instance.addDiseaseEnabled
      if $(event.target).val()
        enababled.set true
      else
        enababled.set false

    "click #add-disease" : (event, instance) ->
      if $("#new-disease").val()
        instance.missingDiseases.insert({name : $("#new-disease").val()})

    "click .remove-disease" : (event, instance) ->
      instance.missingDiseases.remove({name : $(event.currentTarget).data('name')})
