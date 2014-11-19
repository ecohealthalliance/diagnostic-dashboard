Results = @grits.Results

Meteor.publish('results', (resultId) ->
  if @userId
    if resultId
      Results.find({
        _id: resultId
      })
    else
      Results.find({
        userId: @userId
      })
)
