diagnose = (content) =>
  try
    response = HTTP.post("http://localhost:5000/diagnose", {
      data: {
        content: content
      }
    })
    JSON.parse(response.content)
  catch error
    console.log "Error parsing grits API response:"
    console.log response
    console.log error
    throw error

Meteor.methods(
  'diagnose' : (content) ->
    diagnose(content)
)
