Template.header.helpers
  bsveApp: ->
    Router.current().params.query.bsveAccessKey

Template.header.events
  'click .back': (e) ->
    e.preventDefault()
    window.history.back()

