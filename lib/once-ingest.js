var request = require('request');
var config  = require('../config');

var OnceIngest = {};

OnceIngest.createJob = function(asset, cb) {
  var requestBody = buildRequestBody(asset);
  
  // create the URL
  var uri = 'https://api.unicornmedia.com/ingest-api/';
  uri += config.once_domain_guid;
  uri += '/catalogs/' + config.once_catalog_guid;

  // prepare our request
  var requestOptions = {
    uri: uri,
    headers: {
      "X-BC-ONCE-API-KEY": config.once_api_key
    },
    method: 'POST',
    json: true,
    body: requestBody
  };

  // make it
  request(requestOptions, function(err, data) {
    if (err) {
      return cb(err);
    }
    cb(null, data);
  });
};

// builds the API request to ingest
var buildRequestBody = function(asset) {
  return {
    title: asset.name,
    foreignKey: asset._id,
    description: asset.description,
    media: {
      sourceURL: asset.mezzanine
    }
  };
};

module.exports = OnceIngest;
