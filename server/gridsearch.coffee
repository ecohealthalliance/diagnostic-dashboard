EIDR_URL = process.env.EIDR_URL

Meteor.methods(
  'gridsearch' : (query, options) ->
    options ?= {}
    if @userId
      response = HTTP.post(
        "#{EIDR_URL}/search",
          data:
            query: query,
            options: options
      )
      JSON.parse(response.content)

  'eidrUrl': ->
    EIDR_URL or "https://eidr.ecohealthalliance.org"
)
