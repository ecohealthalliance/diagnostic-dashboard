Results = @grits.Results

submit = (content) ->
  resultId = Results.insert
    content: content
    ready: false
  Meteor.call('diagnose', content, (error, result) ->
    Results.update(resultId, {
      content: content
      diseases: result
      ready: true
    })
  )
  resultId


Meteor.methods(
  'submit' : (content) ->
    submit(content)
)