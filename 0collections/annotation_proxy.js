this.grits = this.grits || {};

Meteor.startup(function() {

    var _opts = {
        collections: [
            { db: "diseases", name: "Diseases" },
            { db: "hosts", name: "Hosts" },
            { db: "symptoms", name: "Symptoms" },
            { db: "pathogens", name: "Pathogens" },
            { db: "modes", name: "Modes" }
        ]
        , bindables: ["find", "findOne"] //specify all the operators you want to bind
    };

    //when this runs on the server, you must provide the MONGO_URL to the proxy database
    //as well as an (optional) oplog mongo url
    if (Meteor.isServer) {
        _.extend(_opts, {
            mongoUrl: "mongodb://localhost:27017/annotation"
        });
    }

    this.grits.Annotation = new MeteorDBProxy(_opts);

});
