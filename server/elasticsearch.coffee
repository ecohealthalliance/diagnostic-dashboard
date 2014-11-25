Meteor.methods(
  'elasticsearch' : (query, options) ->
    options ?= {}
    if @userId
      response = HTTP.post(
        "http://localhost:9200/item_index/_search", {
          data: query,
          params: options
        }
      )
      JSON.parse(response.content)
)
