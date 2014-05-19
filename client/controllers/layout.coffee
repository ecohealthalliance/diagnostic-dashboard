Template.layout.isDashboard = () ->
  window.location.pathname.indexOf('dash') >= 0

Template.layout.events
  "click .reset-panels" : () ->
    $('.pane-container').trigger('resetPanes')
