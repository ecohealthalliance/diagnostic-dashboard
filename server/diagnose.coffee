diagnose = (content) =>
  try
    response = HTTP.post("http://localhost:5000/diagnose", {data: {
      content: content
    }})
    response.content
  catch error
    console.log error
    console.log "diagnosis server unavailable"
    null

Meteor.methods(
  'diagnose' : (content) ->
    diagnose(content)
)
