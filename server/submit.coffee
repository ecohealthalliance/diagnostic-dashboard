Results = @grits.Results

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
      Results.update resultId, {
        $set : {
          diseases: result.diseases
          features: result.features
          keywords: result.keywords_found
          diagnoserVersion: result.diagnoserVersion
          ready: true
          createDate: new Date()
        }
      }
    )
  Meteor.setTimeout(diagnose, 0)
  resultId


Meteor.methods(
  'submit' : (content) ->
    submit(content, @userId)
  'rediagnose' : (prevDiagnosis) ->
    submit(prevDiagnosis.content, @userId, prevDiagnosis)
)
