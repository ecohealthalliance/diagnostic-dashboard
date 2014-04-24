Template.submit.events
  "click #submit-button": () ->
    text = $('#submit-text').val()
    Meteor.call('diagnose', text, (error, results) ->
      if error
        console.log error
        $('.results').html("Sorry, there was an error")
      else
        $('.results').html(JSON.stringify(results))
    )
