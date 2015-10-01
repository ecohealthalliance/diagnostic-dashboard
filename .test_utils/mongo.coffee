mongodb = require '../../.meteor/local/build/node_modules/mongodb'

module.exports = (collectionName, command, options, callback) ->

  # options parameter is optional
  if typeof options is 'function'
    callback = options
    options = {}

  mongodb.MongoClient.connect "mongodb://localhost:3001/meteor", (err, db) ->
    try
      dbCallback = (err, result) ->
        db.close()
        callback err

      collection = new mongodb.Collection db, collectionName, db.pkFactory, {}
      collection[command] options, dbCallback

    catch err
      db.close()
      callback err
