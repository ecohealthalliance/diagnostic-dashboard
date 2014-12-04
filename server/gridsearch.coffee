Meteor.methods(
  'gridsearch' : (query, options) ->
    options ?= {}
    if @userId
      response = HTTP.post(
        "http://54.164.176.170/search",
          data:
            query: query,
            options: options
      )
      JSON.parse(response.content)
)
