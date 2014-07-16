Results = @grits.Results

submit = (content, userId) ->
  resultId = Results.insert
    content: content
    userId: userId
    ready: false
  diagnose = () ->
    Meteor.call('diagnose', content, (error, result) ->
      if error
        Results.update(resultId, {
          content: content
          userId: userId
          ready: true
          error: true
        })
      else
        Results.update(resultId, {
          content: content
          userId: userId
          diseases: result.diseases
          features: result.features
          keywords: result.keywords_found
          diagnoserVersion: result.diagnoserVersion
          ready: true
          createDate: new Date()
        })
    )
  Meteor.setTimeout(diagnose, 0)
  resultId


Meteor.methods(
  'submit' : (content) ->
    submit(content, @userId)
)
