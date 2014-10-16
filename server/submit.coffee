Results = @grits.Results
Quarantine = @grits.Quarantine

submit = (content, userId, prevDiagnosis) ->
  if prevDiagnosis
    resultId = Results.insert
      content: content
      userId: userId
      ready: false
      prevDiagnosisId: prevDiagnosis._id
    Results.update prevDiagnosis._id, {
      $set : {
        updatedDiagnosisId: resultId
      }
    }
  else
    resultId = Results.insert
      content: content
      userId: userId
      ready: false
  diagnose = () ->
    Meteor.call('diagnose', content, (error, result) ->
      if error
        message = error?.stack?.split('\n')?[0]
        Results.update resultId, { '$set': {
          ready: true
          error: message
        }}
      else if result.error
        Results.update resultId, { '$set': {
          ready: true
          error: result.error
        }}
      else
        Results.update resultId, {
          $set : {
            diseases: result.diseases
            features: result.features
            keywords: result.keywords_found
            keypoints: result.keypoints
            diagnoserVersion: result.diagnoserVersion
            ready: true
            createDate: new Date()
          }}
    )
  Meteor.setTimeout(diagnose, 0)
  resultId


Meteor.methods(
  'submit' : (content, userId) ->
    submit(content, userId or @userId)

  'submitFromQuarantine' : (submissionId) ->
    content = Quarantine.findOne(submissionId)?.content
    result = false
    if content
      Quarantine.remove(submissionId)
      result = submit(content, @userId)
    result

  'rediagnose' : (prevDiagnosis) ->
    submit(prevDiagnosis.content, @userId, prevDiagnosis)

)
