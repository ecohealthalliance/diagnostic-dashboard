Router.configure
  layoutTemplate: "layout"


Router.map () ->

  @route "dash"

  @route("home",
    path: "/"
    onAfterAction: () ->
      Router.go "dash"
  )
