feedback = @grits.feedback

Meteor.publish('feedback', () ->
  if @userId
    feedback.find()
)
