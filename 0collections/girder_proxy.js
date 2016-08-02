this.grits = this.grits || {};

Meteor.startup(function() {

    if (typeof process != 'undefined' && process.env.MONGO_URL) {
        var mongo_url = process.env.MONGO_URL;
    } else {
        var mongo_url = 'mongodb://localhost:27017/girder';
    }

    var _opts = {
        collections: [
            { db: "item", name: "Items" },
            { db: "keywords", name: "Keywords" },
            { db: "diseaseNames", name: "DiseaseNames"}
        ]
        , bindables: ["find", "findOne"] //specify all the operators you want to bind
    };

    //when this runs on the server, you must provide the MONGO_URL to the proxy database
    //as well as an (optional) oplog mongo url
    if (Meteor.isServer) {
        _.extend(_opts, {
            mongoUrl: mongo_url
        });
    }

    this.grits.Girder = new MeteorDBProxy(_opts);
});
