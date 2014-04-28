Router.map () ->
  @route('diagnose', {
    path: '/diagnose'
    where: 'server'
    action: () ->
      text = @request.body.content
      if not text
        @response.writeHead(400)
      else
        @response.setHeader('Content-Type', 'application/json')
        sendProcessing = () =>
            @response.write(' ')
        setInterval(sendProcessing, 1000)
        diagnosis = Meteor.call('diagnose', text)
        @response.write(JSON.stringify(diagnosis))
  })

Router.map () ->
  @route('submit', {
    path: '/submit'
    where: 'server'
    action: () ->
      text = @request.body.content
      host = @request.headers.host
      method = if @request.connection.encrypted then 'https' else 'http'
      console.log method
      if not text
        @response.writeHead(400)
      else
        @response.setHeader('Content-Type', 'application/json')
        sendProcessing = () =>
            @response.write(' ')
        setInterval(sendProcessing, 1000)
        resultId = Meteor.call('submit', text)
        path = Router.routes['dash'].path {_id: resultId}
        dashboardUrl = "#{method}://#{host}#{path}"
        @response.write(dashboardUrl)
  })
