Template.submit.events
  "click #submit-button": () ->
    text = $('#submit-text').val()
    Meteor.call('submit', text, (error, resultId) ->
      Router.go 'dash', {_id: resultId}
    )
