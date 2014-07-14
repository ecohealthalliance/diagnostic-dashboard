Meteor.publish("girder", () =>
    @grits.Girder.Items.find({}, {limit: 10})
)
