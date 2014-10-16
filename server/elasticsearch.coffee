Meteor.methods(
  'elasticsearch' : (query) ->
    if @userId
      #54.225.25.198
      response = HTTP.post("http://localhost:9200/item_index/_search", {
        data: query
      })
      JSON.parse(response.content)
)
