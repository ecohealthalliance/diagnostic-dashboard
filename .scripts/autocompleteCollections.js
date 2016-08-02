// This code accesses mongo to do a map-reduce query
// that creates a collection with the distinct disease classifications
// that have been applied to articles in the girder database.
// The disease classifications are used by the autocomplete on the search page.

if (typeof process != 'undefined' && process.env.MONGO_URL) {
  url_array = process.env.MONGO_URL.split("/")
  mongo_url = url_array[0] + "//" + url_array[2]
} else {
  mongo_url = "localhost:27017"
}

var mongodb = new Mongo(mongo_url);
var db = mongodb.getDB('girder');
var collection = db.item;
collection.mapReduce(
  function () {
    if (this.meta.diagnosis && this.meta.diagnosis.diseases) {
      this.meta.diagnosis.diseases.forEach(function (disease) {
        emit(disease.name, 1);
      });
    }
  },
  function (disease, values) {
    return Array.sum(values);
  },
  { out: { "replace" : "diseaseNames" } }
);
print("Disease name colleciton created");
