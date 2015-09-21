Meteor.methods(
  'elasticsearch' : (query, options) ->
    # Elasticsearch will only return the fields in the _source property
    query["_source"] = [ "meta.*", "description" ]
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
