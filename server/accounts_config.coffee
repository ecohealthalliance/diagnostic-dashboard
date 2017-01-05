Meteor.startup ->
  Accounts.emailTemplates.siteName = "GRITS"
  Accounts.emailTemplates.from = "GRITS <no-reply@grits>"

Meteor.methods(
  ###
  # Create or update a meteor account for a BSVE user with the given auth info.
  # @param authInfo.authTicket - The BSVE authTicket used to verify the account
  #   with the BSVE.
  # @param authInfo.user - The BSVE user's username. The meteor username
  #   is the BSVE username with bsve- prepended.
  ###
  setPasswordViaBSVEAuthTicket: (authInfo)->
    # The api path chosen here is aribitrary, the call is only to verify that
    # the auth ticket works.
    response = HTTP.get("https://api.bsvecosystem.net/data/v2/sources/PON", {
      headers:
        "harbinger-auth-ticket": authInfo.authTicket
    })
    if Meteor.settings.private?.disableBSVEAuthentication
      throw new Meteor.Error("BSVEAuthFailure", "BSVE Authentication is disabled.")
    if response.data.status != 1
      throw new Meteor.Error("BSVEAuthFailure", response.data.message)
    meteorUser = Meteor.users.findOne(username: "bsve-" + authInfo.user)
    if not meteorUser
      console.log "Creating user"
      {firstName, lastName} = authInfo.userData
      userId = Accounts.createUser(
        username: "bsve-" + authInfo.user
        profile:
          name: firstName + " " + lastName
      )
    else
      userId = meteorUser._id
    password = Random.secret()
    Accounts.setPassword(userId, password, logout:false)
    return password
)
