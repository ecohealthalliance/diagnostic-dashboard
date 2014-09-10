Quarantine = @grits.Quarantine

# delete submission after five minutes
TIMEOUT = 5 * 60 * 1000

quarantine = (content) ->
  submissionId = Quarantine.insert
    content: content
  deleteOnTimeout = () ->
    Quarantine.remove(submissionId)
  Meteor.setTimeout deleteOnTimeout, TIMEOUT
  submissionId


Meteor.methods(
  'quarantine' : (content) ->
    quarantine(content)
)
