this.grits = this.grits || {};

Meteor.startup(function() {

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
            mongoUrl: "mongodb://localhost:27017/girder"
        });
    }

    this.grits.Girder = new MeteorDBProxy(_opts);
});
