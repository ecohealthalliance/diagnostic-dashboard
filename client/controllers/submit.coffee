Template.submit.results = () ->
  Session.get('results')

Template.submit.features = () ->
  _.keys(Session.get('results').features)

Template.submit.events
  "click #submit-button": () ->
    text = $('#submit-text').val()
    Meteor.call('diagnose', text, (error, results) ->
      if error
        console.log error
        $('.results').html("Sorry, there was an error")
      else
        console.log results
        Session.set('results', JSON.parse(results))
    )
