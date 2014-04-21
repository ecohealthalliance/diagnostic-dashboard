Results = @grits.Results

Meteor.publish('results', () ->
  Results.find()
)
