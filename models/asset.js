var Datastore = require('nedb');
var db = new Datastore({ filename: 'db/assets.db', autoload: true });

var Asset = {};

// create a simple asset
Asset.create = function(asset, cb) {
  var createTimestamp = Date.now();
  var newAsset = {
    mezzanine: asset.mezzanine,
    hlsUrl: asset.hlsUrl,
    name: asset.name,
    description: asset.description,
    created_at: createTimestamp,
    updated_at: createTimestamp,
    state: 'new'
  };

  db.insert(newAsset, cb);
};

// find the asset
Asset.findById = function(id, cb) {
  db.findOne({ _id: id }, cb);
};

// update the asset with whatever is there
Asset.update = function(id, update, cb) {
  update.updated_at = Date.now();
  db.update({ _id: id }, { $set: update }, {});
  Asset.findById(id, cb);
};

module.exports = Asset;