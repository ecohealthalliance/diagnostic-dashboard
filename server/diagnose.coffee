diagnose = (content) =>
  try
    response = HTTP.post("http://localhost:5000/diagnose", {data: {
      content: content
    }})
    result = JSON.parse(response.content)
    result.features.forEach( (f)->
      if f.type == 'cluster'
        f.locations.forEach( (l)->
          if _.isString l.latitude
            console.log "String latitude found in:"
            console.log l
            l.latitude = parseFloat(l.latitude)
          if _.isString l.longitude
            console.log "String longitude found in:"
            console.log l
            l.longitude = parseFloat(l.longitude)
        )
    )
    result
  catch error
    console.log error
    console.log "diagnosis server unavailable"
    {
      'diseases': [
        {
          'keywords': [
            {'coefficient': 0.18335152117240922, 'name': 'myalgia'}
          ]
          'name': 'Fake Disease A'
          'probability': 0.26593558017197066
        },
        {
          'keywords': [
            {'coefficient': 0.22991723184506982, 'name': 'fever'}
          ],
          'name': 'Fake Disease B'
          'probability': 0.27964091292662618
        }
      ]
      'features': [
        {'type': 'keyword', 'value': 'myalgia'}
        {'type': 'keyword', 'value': 'fever'}
      ]
    }

Meteor.methods(
  'diagnose' : (content) ->
    diagnose(content)
)
