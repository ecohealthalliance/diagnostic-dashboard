Meteor.startup ->
  signupCode = @grits.Config.findOne()?.signupCode

  AccountsEntry.config
    signupCode: signupCode
