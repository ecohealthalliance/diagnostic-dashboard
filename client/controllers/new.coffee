Template.new.events
  "click #submit-button": (instance) ->
    $('#submit-button').prop('disabled', true)
    text = $('#submit-text').val()
    url  = $('#submit-url').val()
    
    if !/^(f|ht)tps?:\/\//i.test(url)
      url = 'http://' + url

    Meteor.call('submit', {
      text: text,
      url: url,
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
