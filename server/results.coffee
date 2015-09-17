Results = @grits.Results

Meteor.publish('results', (query, bsveAccessKey) ->
  if @userId
    Results.find(query)
  else if bsveAccessKey == process.env.BSVE_ACCESS_KEY and query._id
    Results.find(_.extend(query, { bsveSubmission: true }))
)
