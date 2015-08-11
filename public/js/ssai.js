$(function() {
  var asset, player;
  // handle our connections
  var socket = io.connect();
  socket.on('connections', function(data) {
    log(data);
  });
  // handle the Once video being ready
  socket.on('video_published', function(data) {
    // only act on this if it's the same video
    if (data._id === asset._id) {
      $('#status_holder').addClass('hidden');
      asset = data;
      player.height(player.width() * 9/16);
      $(window).resize(function() {
        player.height(player.width() * 9/16);
      });
      player.one('loadedmetadata', function(evt) {
        player.play();
      });
      player.onceux({
        metadataUri: asset.metadataUri
      });
    }
  });
  // just listen for when the video is created
  socket.on('asset_created', function(data) {
    log('asset created!');
    log(data);
    asset = data;
    player = videojs('ssaiPlayer');
    $('#status_holder').removeClass('hidden');
  });

  // special logging because slightly lazy
  function log(data) {
    console.log('ssai.js');
    console.log(data);
  }
});