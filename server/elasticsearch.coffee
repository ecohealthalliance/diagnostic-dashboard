Meteor.methods(
  'elasticsearch' : (query) ->
    must_terms = if must_terms then must_terms else []
    should_terms = if should_terms then should_terms else []
    response = HTTP.post("http://localhost:9200/item_index/_search", {
      data: query
    })
    JSON.parse(response.content)
)
