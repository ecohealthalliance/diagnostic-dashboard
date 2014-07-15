Meteor.publish('users', () ->
  if @userId
    Meteor.users.find()
)
