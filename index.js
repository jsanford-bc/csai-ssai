var Promise        = require('bluebird');
var express        = require('express');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var util           = require('util');
var _              = require('lodash');
var Asset          = Promise.promisifyAll(require('./models/asset.js'));
var OnceIngest     = Promise.promisifyAll(require('./lib/once-ingest.js'));
var app            = express();
var server         = require('http').Server(app);
var io             = require('socket.io')(server);
var Datastore      = require('nedb');
var config         = require('./config');

// Set up Express middlewares
var pub = __dirname + '/public';
app.use(express.static(pub));
app.use(bodyParser.json());
app.use(methodOverride());

var routes = {};

// creation of a new asset
routes.createAsset = function(req, res) {
  // console.log(req.body);

  Asset.createAsync(req.body.asset).bind({}).then(function(asset) {
    this.asset = asset;
    io.emit('asset_created', asset);
    return OnceIngest.createJobAsync(asset);
  }).then(function(response) {
    return Asset.updateAsync(this.asset._id, { state: 'transcoding', once_response: response.body });
  }).then(function(asset) {
    return res.status(201).send(asset);
  }).catch(function(e) {
    console.error(e, e.stack);
    res.status(500).send('Something went wrong');
  });
};

// return the asset
routes.getAsset = function(req, res) {
  Asset.findByIdAsync(req.params.id).then(function(asset) {
    return res.status(200).send(asset);
  });
}

// receive notifications of ingests from Once
routes.handleNotification = function(req, res) {
  console.log(req.body.notification + " notification received!");

  // only really care about publish notifications
  if (req.body.notification === 'publish') {
    var uri = 'http://onceux.unicornmedia.com/now/ads/vmap/od/auto';
    uri += '/' + config.once_domain_guid;
    uri += '/' + config.once_application_guid;
    uri += '/' + req.body.mediaItem.foreignKey;
    uri += '/content.once';
    Asset.updateAsync(req.body.mediaItem.foreignKey, 
                      {
                        state: 'published', 
                        once_published_response: req.body,
                        metadataUri: uri 
                      }).then(function(asset) {
      // tell the clients
      io.emit('video_published', asset);
      res.status(200).send('Thanks guys!');
    }).catch(function(e) {
      console.error(e, e.stack);
      res.status(500).send('Something broke, blame Once');
    });
  }
  
  // otherwise, we're happy with just logging for now, so let Once know we're happy
  else
    res.status(200).send('Thanks guys!');
};

// set up the rest of the routes
app.post('/assets', routes.createAsset);
app.get('/assets/:id', routes.getAsset);
app.post('/notifications', routes.handleNotification);

// set up our connection handlers
io.on('connection', function (socket) {
  socket.emit('connections', { msg: 'Connected' });
});

// Start this party
server.listen(4000, function() {
  console.log('Listening on port %d', server.address().port);
});