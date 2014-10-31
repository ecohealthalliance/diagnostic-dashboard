Results = @grits.Results

Router.map () ->
  @route('submit-by-email', {
    path: '/internal/submit-by-email'
    where: 'server'
    action: () ->
      messageObject = JSON.parse(@request.body.email)

      from = messageObject["From"].split("<")?[1]?.split(">")?[0]
      date = messageObject["Date"]
      content = messageObject["body"]

      user = Meteor.users.findOne({'emails.0.address': from})
      
      submissionId = Meteor.call('submit', content, user?._id)
      checkResult = () ->
        result = Results.findOne({_id: submissionId})
        if result?.ready
          message = ""
          if result.error
            message = "Sorry, there was an error processing this diagnosis.\n"
          else
            message = "Here are some possible diagnoses:\n"
            for disease in result.diseases
              message += "#{disease.name}: #{disease.probability}\n"
          url = Meteor.absoluteUrl("dash/#{submissionId}")
          
          message += "\nView the dashboard: #{url}\n"

          message += "\n\nOn #{date}, #{from} wrote:\n"
          for line in content.split('\n')
            if line
              message += "> #{line}\n"
            else
              message += ">\n"
          
          domain = Meteor.absoluteUrl().replace(/https?:\/\//, "").replace(/\//, "")
          subject = messageObject["Subject"]
          
          Email.send(
            from: "grits@#{domain}"
            to: from
            subject: "Re: #{subject}"
            text: message
            headers:
              "In-Reply-To": messageObject["Message-ID"]
              "Reply-To": "feedback@ecohealth.io"
          )
        else
          Meteor.setTimeout(checkResult, 1000)
      Meteor.setTimeout(checkResult, 1000)
      @response.writeHead(200)
      @response.end()
  })
