Meteor.startup ->
  AccountsEntry.config
    homeRoute: '/'
    dashboardRoute: '/'
    passwordSignupFields: 'EMAIL_ONLY'
    showSignupCode: true
