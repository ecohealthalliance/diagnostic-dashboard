Template.header.helpers
  bsveApp: ->
    Router.current().params.query.bsveAccessKey

  hideBackButton: ->
    Router.current().params.query.hideBackButton

  logoHref: ->
    unless Router.current().params.query.bsveAccessKey
      "/"

  showNewDiagnosisLink: ->
    bsveApp = Router.current().params.query.bsveAccessKey
    onNewDiagnosisPage = Router.current().route.getName() is "new"
    (bsveApp and not onNewDiagnosisPage) or Meteor.user()

  newDiagnosisHref: ->
    key = Router.current().params.query.bsveAccessKey
    if Router.current().params.query.bsveAccessKey
      "/new?bsveAccessKey=#{key}"
    else
      "/new"

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

  'click' : (e) ->
    if $('.navbar-toggle').is(':visible')
      console.log("collapsing")
      $('.navbar-collapse').collapse('toggle')
