Template.header.helpers
  bsveApp: ->
    Router.current().params.query.bsveAccessKey

  hideBackButton: ->
    Router.current().params.query.hideBackButton

Template.helpLink.helpers
  helpLinkHref: ->
    key = Router.current().params.query.bsveAccessKey
    if Router.current().params.query.bsveAccessKey
      "/help?bsveAccessKey=#{key}"
    else
      "/help"

Template.header.events
  'click .back': (e) ->
    e.preventDefault()
    window.history.back()

