postMessageHandler = (event)->
  try
    request = JSON.parse(event.data)
  catch
    # Some things besides the BSVE will trigger the message handler, so if the
    # message isn't JSON, it is ignored and the parsing exception is swallowed.
    return
  request.url = request.link
  submission = _.extend({
    accessKey: Router.current().params.query.bsveAccessKey
  }, request)
  Meteor.call('submit', submission, (error, resultId) ->
    if error
      if error.error is "Bad access key"
        alert "Error: Bad access key"
      else
        alert "Error"
      console.log error
    else
      bsveAccessKey = Router.current().params.query.bsveAccessKey
      Router.go 'dash', {_id: resultId}, {
        query: "bsveAccessKey=#{bsveAccessKey}" if bsveAccessKey
      }
  )
window.addEventListener("message", postMessageHandler, false)
