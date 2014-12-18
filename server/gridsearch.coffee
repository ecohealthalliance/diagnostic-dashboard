GRID_URL = process.env.GRID_URL

Meteor.methods(
  'gridsearch' : (query, options) ->
    options ?= {}
    if @userId
      response = HTTP.post(
        "#{GRID_URL}/search",
          data:
            query: query,
            options: options
      )
      JSON.parse(response.content)

  'gridUrl': () ->
    GRID_URL
)
