// This code accesses mongo to do a map-reduce query
// that creates a collection with the distinct keywords
// used in the diagnoses and their categories.
// Run it with the mongo command.
var mongodb = new Mongo('localhost:27017');
var db = mongodb.getDB('girder');
var collection = db.item;
var map = function () {
  if (this.meta.diagnosis && this.meta.diagnosis.keywords_found) {
    this.meta.diagnosis.keywords_found.forEach(function (kw) {
      emit(kw.name, { categories : kw.categories});
    });
  }
};
var reduce = function (kwName, listOfListsOfCategories) {
  var out = listOfListsOfCategories.reduce(function (sofar, cur) {
    cur.categories.forEach(function (cat) {
      sofar.categories[cat] = true;
    });
    return sofar;
  }, { categories : {} });
  out.categories = Object.keys(out.categories);
  return out;
};

collection.mapReduce(map, reduce,
  { out: { "replace" : "keywords" }},
  function(err,result) {
    if (err) { throw err; }
    console.log("keyword collection created");
  }
);

// This code is similar to the code above, but it creates a collection of
// distinct diseases we've diagnosed.
var map = function () {
  if (this.meta.diagnosis && this.meta.diagnosis.diseases) {
    this.meta.diagnosis.diseases.forEach(function (disease) {
      emit(disease.name, 1);
    });
  }
};
var reduce = function (disease, values) {
  return Array.sum(values);
};
collection.mapReduce(map, reduce,
  { out: { "replace" : "diseaseNames" }},
  function(err,result) {
    if (err) { throw err; }
    console.log("diseaseNames collection created");
  }
);
