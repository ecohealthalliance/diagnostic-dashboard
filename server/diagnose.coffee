diagnose = (postData) =>
  try
    postData.returnSourceContent = true
    response = HTTP.post("http://localhost:5000/diagnose", {
      data: postData
    })
    JSON.parse(response.content)
  catch error
    console.log "Error parsing grits API response:"
    console.log response
    console.log error
    throw error

Meteor.methods(
  'diagnose' : (postData) ->
    diagnose(postData)
)
