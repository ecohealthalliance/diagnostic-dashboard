caseCounts = @grits.caseCounts
Meteor.publish('caseCounts', () ->
  if @userId
    caseCounts.find()
)
