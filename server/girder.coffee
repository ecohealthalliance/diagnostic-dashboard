Items = () =>
  @grits.Girder.Items

Meteor.publish("item", (query, options) ->
    if @userId
      allOptions = {limit: 50, fields : {'meta':1, 'description':1}}
      if _.isObject(options)
        _.extend(allOptions, options)
      # The limit can cause seemingly inconsistent results where narrowing down
      # a queries causes articles to appear.
      Items().find(query, allOptions)
)
