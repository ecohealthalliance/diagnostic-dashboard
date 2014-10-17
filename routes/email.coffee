Results = @grits.Results

Router.map () ->
  @route('submit-by-email', {
    path: '/internal/submit-by-email'
    where: 'server'
    action: () ->
      email = @request.body.email

      from = email.split("\nFrom:")?[1]?.split("<")?[1]?.split(">")?[0]
      subject = email.split("\nSubject: ")?[1]?.split("\n")[0]
      messageId = email.split("Message-ID: <")?[1]?.split(">")?[0].replace(/\s/g, "+")
      date = /Date:\s(.*)/.exec(email)?[1]

      boundary = /boundary=([0-9a-f]{28})/.exec(email)?[1]
      content = email.split("--#{boundary}")?[1].replace(/\sContent-Type:\s.*\s/, "")

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
          domain = Meteor.absoluteUrl().replace(/https?:\/\//, "").replace(/\//, "")
          message += "\nView the dashboard: #{url}\n"

          message += "\n\nOn #{date}, #{from} wrote:\n"
          for line in content.split('\n')
            if line
              message += "> #{line}\n"
            else
              message += ">\n"

          Email.send(
            from: "grits@#{domain}"
            to: from
            subject: "Re: #{subject}"
            text: message
            headers:
              "In-Reply-To": "<#{messageId}>"
              "Reply-To": "feedback@ecohealth.io"
          )
        else
          Meteor.setTimeout(checkResult, 1000)
      Meteor.setTimeout(checkResult, 1000)
      @response.writeHead(200)
      @response.end()
  })
