Results = @grits.Results

submit = (content, userId, oldResultId) ->
  resultId = Results.insert
    content: content
    userId: userId
    ready: false
  diagnose = () ->
    Meteor.call('diagnose', content, (error, result) ->
      if error
        message = error?.stack?.split('\n')?[0]
        Results.update(resultId, { '$set': {
          ready: true
          error: message
        }})
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
        if oldResultId
          Results.update(oldResultId, { '$set': {
            ready: true
            replacedBy: resultId
          }})
    )
  Meteor.setTimeout(diagnose, 0)
  resultId


Meteor.methods(
  'submit' : (content) ->
    submit(content, @userId)

  'retry' : (resultId) ->
    result = Results.findOne({_id: resultId})
    submit(result.content, result.userId, resultId)
)
