Results = @grits.Results
Quarantine = @grits.Quarantine

submit = (content) ->
  resultId = Results.insert
    content: content
    ready: false
  Meteor.call('diagnose', content, (error, result) ->
    Results.update(resultId, {
      content: content
      diseases: result.diseases
      features: result.features
      keywords: result.keywords_found
      ready: true
    })
  )
  resultId


Meteor.methods(
  'submit' : (content) ->
    submit(content)

  'submitFromQuarantine' : (submissionId) ->
    content = Quarantine.findOne(submissionId)?.content
    result = false
    if content
      Quarantine.remove(submissionId)
      result = submit(content)
    result
)
