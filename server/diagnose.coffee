diagnose = (content) =>
  try
    response = HTTP.post("http://localhost:5000/diagnose", {data: {
      content: content
    }})
    JSON.parse(response.content)
  catch error
    console.log error
    console.log "diagnosis server unavailable"

Meteor.methods(
  'diagnose' : (content) ->
    diagnose(content)
)
