@grits ?= {}
@grits.caseCounts = new Meteor.Collection("caseCounts")
@grits.caseCounts.allow(insert: (userId, document) -> userId)
