@grits ?= {}
@grits.feedback = new Meteor.Collection("feedback")
@grits.feedback.allow(insert: (userId, document) -> userId)
