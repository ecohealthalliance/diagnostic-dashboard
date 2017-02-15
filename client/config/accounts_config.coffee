AccountsTemplates.configureRoute 'signIn',
  layoutTemplate: 'layout',
  redirect: ->
    if window.location.pathname == '/sign-in'
      Router.go '/'

AccountsTemplates.configure
  showForgotPasswordLink: true
