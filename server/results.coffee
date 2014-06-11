Results = @grits.Results

Meteor.publish('results', () ->
  if @userId
    Results.find()
)
