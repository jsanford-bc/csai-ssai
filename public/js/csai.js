$(function() {
  var asset, player;
  // handle our connections
  var socket = io.connect();
  socket.on('connections', function(data) {
    log(data);
  });
  // video published handler
  socket.on('video_published', function(data) {
    // if this is the same video, then get rid of the player
    if (data._id === asset._id) {
      player.dispose();
      $('#status_holder').removeClass('hidden');
    }
  });
  // asset created handler
  socket.on('asset_created', function(data) {
    asset = data;
    player = videojs('csaiPlayer');
    player.ima3({
      prerollTimeout: 5000,
      serverUrl: 'http://solutions.brightcove.com/jsanford/tools/vast.php'
    });
    player.one('loadedmetadata', function(evt) {
      player.play();
    });
    player.src([
      { type: 'application/x-mpegUrl', src: asset.hlsUrl }
    ]);
    player.height(player.width() * 9/16);
    $(window).resize(function() {
      player.height(player.width() * 9/16);
    });
  });

  // special logging because slightly lazy
  function log(data) {
    console.log('csai.js');
    console.log(data);
  }
});