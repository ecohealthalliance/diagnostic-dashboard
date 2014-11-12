Template.new.events
  "click #submit-button": () ->
    $('#submit-button').prop('disabled', true)
    text = $('#submit-text').val()
    Meteor.call('submit', text, (error, resultId) ->
      Router.go 'dash', {_id: resultId}
    )
