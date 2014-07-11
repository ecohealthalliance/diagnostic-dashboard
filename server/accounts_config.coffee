Meteor.startup ->
  signupCode = @grits.Config.findOne()?.signupCode

  AccountsEntry.config
    signupCode: signupCode

  Accounts.emailTemplates.siteName = "GRITS"
  Accounts.emailTemplates.from = "GRITS <no-reply@grits>"
