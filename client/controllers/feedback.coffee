@missingDiseases = new Meteor.Collection(null)
Template.feedback.missingDiseases = ()-> missingDiseases.find()

Template.feedback.events
  "click .submit-feedback": (event) ->
    form = $('form.feedback').serializeArray()
    parseDisease = (f)->
        diseaseMatch = f.name.match(/(.*)-correct/)
        if diseaseMatch then diseaseMatch[1] else false
    feedbackItem = {
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
      missingDiseases : missingDiseases.find().map((x)->x.name)
    }
    grits.feedback.update(Session.get('feedbackId'), $set : feedbackItem)
    $('form.feedback').hide()

  "click .close-feedback": (event) =>
    $('form.feedback').hide()
  
  "click #add-disease" : (event) ->
    missingDiseases.insert({name : $("#new-disease").val()})

  "click .remove-disease" : (event) ->
    missingDiseases.remove({name : $(event.currentTarget).data('name')})

Template.feedback.diseaseCompleteSettings = ()->
  {
    position: "bottom",
    limit: 5,
    rules: [
      {
        collection: grits.Girder.DiseaseNames,
        field: "_id",
        template: Template.autocompletePill
      },
    ]
  }
