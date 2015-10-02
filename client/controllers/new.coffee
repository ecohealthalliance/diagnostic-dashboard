Template.new.events
  "click #submit-button": (instance) ->
    $('#submit-button').prop('disabled', true)
    text = $('#submit-text').val()
    Meteor.call('submit', {
      text: text,
      accessKey: Router.current().params.query.bsveAccessKey
    }, (error, resultId) ->
      if error
        if error.error is "Bad access key"
          alert "Error: Bad access key"
        else
          alert "Error"
        console.log error
      else
        bsveAccessKey = Router.current().params.query.bsveAccessKey
        Router.go 'dash', {_id: resultId}, {
          query: "bsveAccessKey=#{bsveAccessKey}" if bsveAccessKey
        }
    )
