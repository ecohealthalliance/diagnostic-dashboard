Template.layout.isDashboard = () ->
  window.location.pathname.indexOf('dash') >= 0

Template.layout.rendered = ->
  if Router.current().params.query.bsveAccessKey
    $('body').addClass('bsve')
