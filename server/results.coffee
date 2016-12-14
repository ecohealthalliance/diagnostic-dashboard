Results = @grits.Results

Meteor.publish('results', (query) ->
  if @userId
    Results.find(query)
  else if query._id
    Results.find(query)
)
