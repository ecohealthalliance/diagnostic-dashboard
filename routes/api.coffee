Router.map () ->
  @route('diagnose', {
    path: '/diagnose'
    where: 'server'
    action: () ->
      # Temporarily disabled until we decide how to authenticate
      @response.writeHead(400)
      return @response.end()
      text = @request.body.content
      if not text
        @response.writeHead(400)
        @response.end()
      else
        @response.setHeader('Content-Type', 'application/json')
        sendProcessing = () =>
            @response.write(' ')
        setInterval(sendProcessing, 1000)
        diagnosis = Meteor.call('diagnose', text)
        @response.write(JSON.stringify(diagnosis))
        @response.end()
  })

Router.map () ->
  @route('submit', {
    path: '/submit'
    where: 'server'
    action: () ->
      text = @request.body.content
      host = @request.headers.host
      method = if @request.connection.encrypted then 'https' else 'http'
      if not text
        @response.writeHead(400)
        @response.end()
      else
        submissionId = Meteor.call('quarantine', text)
        path = Router.routes['authenticateSubmission'].path {_id: submissionId}
        authenticateUrl = "#{method}://#{host}#{path}"
        @response.setHeader('Location', authenticateUrl)
        @response.writeHead(303)
        @response.end()
  })

Router.map () ->
  # these go to apache on the server, so we need to make sure
  # the client doesn't handle them
  @route('api', {
      path: '/api(.*)'
      where: 'server'
  })
  @route('gritsdb', {
      path: '/gritsdb(.*)'
      where: 'server'
  })
