Results = @grits.Results

submit = (content, userId) ->
  resultId = Results.insert
    content: content
    userId: userId
    ready: false
  Meteor.call('diagnose', content, (error, result) ->
    Results.update(resultId, {
      content: content
      userId: userId
      diseases: result.diseases
      features: result.features
      keywords: result.keywords_found
      ready: true
    })
  )
  resultId


Meteor.methods(
  'submit' : (content) ->
    submit(content, @userId)
)
