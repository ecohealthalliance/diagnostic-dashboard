Template.new.created = ->
  @source = new ReactiveVar 'text'

Template.new.rendered = ->
  @autorun =>
    source = @source.get()
    if source is 'url' and not @$('.submit-url').val()
      buttonState = true
    else if source is 'text' and not @$('textarea').val()
      buttonState = true
    else
      buttonState = false

    @$('#submit-button').prop('disabled', buttonState)

Template.new.events
  'click .upload-menu a': (event, instance) ->
    instance.source.set($(event.target).data('source'))

  'input textarea, input .submit-url': (event, instance) ->
    buttonState = false
    if instance.$(event.target).val()
      buttonState = true

    instance.$('#submit-button').prop('disabled', not buttonState)

  "click #submit-button": (event, instance) ->
    $('#submit-button').prop('disabled', true)
    if instance.source.get() is 'url'
      url = $('#submit-url').val()
      if !/^(f|ht)tps?:\/\//i.test(url)
        url = 'http://' + url
      text = null
    else
      text = $('#submit-text').val()
      url = null

    Meteor.call 'submit', {
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
