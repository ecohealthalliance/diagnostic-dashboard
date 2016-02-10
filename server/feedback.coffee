feedback = @grits.feedback

Meteor.publish('feedback', () ->
  if @userId
    feedback.find()
)

Meteor.methods
  submitFeedback: (id, feedbackItem) ->
    feedback.update(id, $set : feedbackItem)
