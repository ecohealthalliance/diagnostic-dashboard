Meteor.startup ->
  # This code accesses the underlying node.js mongo lib to do a map-reduce query
  # that creates a collection with the distinct keywords used in the diagnoses
  # and their categories.
  # The method for accessing mongo is based on the answer here:
  # http://stackoverflow.com/questions/14901761/mongodb-distinct-implementation-in-meteor-on-the-server/14935991#comment38245027_14935991
  grits.GirderItems.find()._mongo.db.createCollection(grits.GirderItems._name, (err, collection)=>
    if err then throw err
    collection.mapReduce(
      """
      function(){
        if(this.meta.diagnosis && this.meta.diagnosis.keywords_found)
          this.meta.diagnosis.keywords_found.forEach(function(kw){
            emit(kw.name, { categories : kw.categories});
          });
      }
      """,
      """
      function(kwName, listOfListsOfCategories){
        var out = listOfListsOfCategories.reduce(function(sofar, cur){
          cur.categories.forEach(function(cat){
            sofar.categories[cat] = true;
          });
          return sofar
        }, { categories : {} });
        out.categories = Object.keys(out.categories);
        return out;
      }
      """,
      { out: { "replace" : "keywords" }},
      (err,result)=>
        if err then throw err
        console.log "keyword collection created"
        Keywords = new Meteor.Collection('keywords')
        Meteor.publish('keywords', (query) ->
          if @userId
            Keywords.find({})
        )
    )
  )
  
  # This code is similar to the code above, but it creates a collection of
  # distinct diseases we've diagnosed.
  grits.GirderItems.find()._mongo.db.createCollection(grits.GirderItems._name, (err, collection)=>
    if err then throw err
    collection.mapReduce(
      """
      function(){
        if(this.meta.diagnosis && this.meta.diagnosis.diseases)
          this.meta.diagnosis.diseases.forEach(function(disease){
            emit(disease.name, 1);
          });
      }
      """,
      """
      function(disease, values){
        return Array.sum(values);
      }
      """,
      { out: { "replace" : "diseaseNames" }},
      (err,result)=>
        if err then throw err
        console.log "diseaseNames collection created"
        DiseaseNames = new Meteor.Collection('diseaseNames')
        Meteor.publish('diseaseNames', (query) ->
          if @userId
            DiseaseNames.find({})
        )
    )
  )



