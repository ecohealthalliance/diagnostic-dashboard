if Meteor.isClient
  Template.feedback.created = ->
    @missingDiseases = new Meteor.Collection(null)
    @feedbackBaseData = new ReactiveVar(null)
    @addDiseaseEnabled = new ReactiveVar(false)
    # Dynamically load disease names for the autocomplete
    Meteor.subscribe('diseaseNames')
    @autorun =>
      @feedbackBaseData.set
        userId: Meteor.userId()
        diagnosisId: Iron.controller().getParams()?._id

  Template.feedback.rendered = ->
    @autorun =>
      storedFeedback = grits.feedback.findOne(@feedbackBaseData.get())
      if storedFeedback
        # Repopulate feedback form so users can edit it later
        $('[name="comments"]').val(storedFeedback?.comments)
        $('[name="general_comments"]').val(storedFeedback?.generalComments)
        storedFeedback.correctDiseases?.forEach((d)->
          $('[name="' + d + '-correct"][value=true]').prop('checked', true)
        )
        storedFeedback.incorrectDiseases?.forEach((d)->
          $('[name="' + d + '-correct"][value=false]').prop('checked', true)
        )
        @missingDiseases.find({}, reactive: false).forEach (d)=>
          @missingDiseases.remove(d._id)
        storedFeedback.missingDiseases?.forEach (d)=>
          @missingDiseases.insert(name : d)

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
      event.stopPropagation()
      form = $(event.target).serializeArray()
      parseDisease = (f)->
          diseaseMatch = f.name.match(/(.*)-correct/)
          if diseaseMatch then diseaseMatch[1] else false
      feedbackItem =
        diagnosisId : Iron.controller().getParams()?._id
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
      storedFeedback = grits.feedback.findOne(instance.feedbackBaseData.get())
      if storedFeedback
        grits.feedback.update(
          storedFeedback._id,
          $set: feedbackItem
        )
      else
        grits.feedback.insert(
          _.extend({
            created: new Date()
            userEmail: Meteor.user().emails[0].address
          }, instance.feedbackBaseData.get(), feedbackItem)
        )
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

    "click .remove-selection" : (event, instance) ->
      instance.missingDiseases.remove({name : $(event.currentTarget).data('name')})
