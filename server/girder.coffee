Items = () =>
  @grits.Girder.Items

Meteor.publish("item", (query) ->
    if @userId
      # The limit can cause seemingly inconsistent results where narrowing down
      # a queries causes articles to appear.
      Items().find(query, {limit: 100, fields : {'meta':1, 'description':1}})
)
