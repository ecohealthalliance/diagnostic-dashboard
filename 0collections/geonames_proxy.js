this.grits = this.grits || {};

Meteor.startup(function() {
    if (process.env.MONGO_URL) {
        var mongo_url = process.env.MONGO_URL;
    } else {
        var mongo_url = 'mongodb://localhost:27017/geonames';
    }

    var _opts = {
        collections: [
            { db: "allCountries", name: "AllCountries" }
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

    this.grits.Geonames = new MeteorDBProxy(_opts);

});
