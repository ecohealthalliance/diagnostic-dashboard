@grits ?= {}
@grits.feedback = new Meteor.Collection("feedback")
@grits.feedback.allow(
    insert: (userId, document) -> userId
    update: (userId, document) ->
        userId == document.userId
)
