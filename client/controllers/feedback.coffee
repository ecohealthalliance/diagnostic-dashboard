Template.feedback.events
  "click .submit-feedback": (event) =>
    if $(event.currentTarget).hasClass('disabled') then return
    $(event.currentTarget).addClass('disabled')
    feedbackItem = {
      diagnosisId : window.location.pathname.split('/').pop()
      userId : Meteor.userId()
      version: "0.0.1"
      form : $('form.feedback').serializeArray()
    }
    @grits.feedback.insert(feedbackItem)
    $('form.feedback').hide()

  "click .close-feedback": (event) =>
    $('form.feedback').hide()