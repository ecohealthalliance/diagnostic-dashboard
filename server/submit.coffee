Results = @grits.Results
Quarantine = @grits.Quarantine

submit = (submission) ->
  if submission.text
    submission.content = submission.text
  postData = _.pick(
    submission,
    'content',
    'url'
  )
  prevDiagnosis = submission.prevDiagnosis
  bsveSubmission = false
  accessKey = submission.accessKey
  if not submission.userId
    if accessKey
      bsveSubmission = true
      if accessKey != process.env.BSVE_ACCESS_KEY
        throw new Meteor.Error("Bad access key")
    else
      throw new Meteor.Error("User not authenticated")
  if prevDiagnosis
    resultId = Results.insert(_.extend({
      ready: false
      userId: submission.userId
      bsveSubmission: bsveSubmission
      prevDiagnosisId: prevDiagnosis._id
    }, postData))
    Results.update prevDiagnosis._id, {
      $set : {
        updatedDiagnosisId: resultId
      }
    }
  else
    resultId = Results.insert(_.extend({
      ready: false
      userId: submission.userId
      bsveSubmission: bsveSubmission
    }, postData))
  diagnose = () ->
    Meteor.call('diagnose', postData, (error, result) ->
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
            processedContent: result?.source?.englishTranslation?.content or result?.source?.cleanContent?.content
            ready: true
            createDate: new Date()
          }}
    )
  Meteor.setTimeout(diagnose, 0)
  resultId


Meteor.methods(
  'submit' : (submission) ->
    submit(_.extend({
      userId: @userId
    }, submission))

  'submitFromQuarantine' : (submissionId) ->
    content = Quarantine.findOne(submissionId)?.content
    result = false
    if content
      Quarantine.remove(submissionId)
      result = submit
        text: content
        userId: @userId
    result

  'rediagnose' : (prevDiagnosis) ->
    submit
      text: prevDiagnosis.content
      userId: @userId
      prevDiagnosis: prevDiagnosis

)
