Results = @grits.Results

Meteor.publish('results', (query) ->
  if @userId
    Results.find(query)
)
