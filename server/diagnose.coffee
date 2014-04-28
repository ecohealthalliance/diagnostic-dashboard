diagnose = (content) =>
  try
    response = HTTP.post("http://localhost:5000/diagnose", {data: {
      content: content
    }})
    JSON.parse(response.content)
  catch error
    console.log error
    console.log "diagnosis server unavailable"
    # temporarily return mock content if diagnosis server isn't running
    # this is the expected format from the diagnosis server once JSON-parsed
    [
      {name: 'MERS', rank: 1, features: ['fever', 'cough']}
      {name: 'Dengue', rank: 2, features: ['fever', 'nausea']}
    ]

Meteor.methods(
  'diagnose' : (content) ->
    diagnose(content)
)
