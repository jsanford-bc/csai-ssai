$(function() {
  // need to remember our players and the asset
  var asset, 
      adPlayer, 
      createAssetTime, 
      assetIngestedTime, 
      numPlayers = 0;

  // disable buttons immediately
  $('#load_csai_btn').attr('disabled', 'disabled');
  $('#load_ssai_btn').attr('disabled', 'disabled');

  // handle resizing if we need to
  $(window).resize(function(event) {
    if (adPlayer)
      adPlayer.height(adPlayer.width()*9/16);
  });

  // handle callbacks
  var socket = io.connect();
  socket.on('connections', function(data) {
    console.log(data);
  });
  socket.on('video_published', function(data) {
    console.log('Video published!');
    console.log(data);
    // make sure it's the asset we care about
    if (data._id === asset._id) {
      assetIngestedTime = Date.now();
      console.log("And it's ours!");
      console.log(assetIngestedTime - createAssetTime);
      asset = data;
      $('#load_ssai_btn').removeAttr('disabled');  
    }
    // otherwise it's not the one we care about
  });

  // party starts when the user clicks create
  $('#create_asset_btn').click(function() {
    $('#create_asset_btn').attr('disabled', 'disabled');
    // make our call
    var data = {
      asset: {
        mezzanine: $('#mezz_input').val(),
        hlsUrl: $('#hls_input').val(),
        name: 'Test ' + Date.now(),
        description: 'Test for CSAI vs SSAI'
      }
    }

    $.ajax({
      type: 'POST',
      url: '/asset',
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function(data, textStatus, xhr) {
        createAssetTime = Date.now();
        console.log(xhr);
        if (xhr.status === 201) {
          console.log('created!');
          asset = data;
          $('#load_csai_btn').removeAttr('disabled');
        }
        else {
          console.log('wtf?');
        }
      }
    });
  });

  // destroy the ssai player if it exists, load the csai one
  $('#load_csai_btn').click(function() {
    $('#load_csai_btn').attr('disabled', 'disabled');

    // destroy the player if it exists
    if (adPlayer) {
      adPlayer.dispose();
      adPlayer = null;
    }

    // and show the CSAI player
    var playerId = 'ad_player' + numPlayers++;
    var playerTemplate = '<video' + 
                         '  id="' + playerId + '"' +
                         '  data-account="1924997959001"' +
                         '  data-player="c800c858-444c-45d7-af6c-4ce98cd42a67"' +
                         '  data-embed="default"' +
                         '  width=100%' +
                         '  height=360px' +
                         '  class="video-js" controls></video>';

    // inject it
    var $player = $(playerTemplate);
    $('#player_holder').empty().append($player);
    bc($player[0]);
    videojs(playerId).ready(function() {
      adPlayer = this;
      console.log('CSAI player shown');
      console.log(asset);
      console.log(adPlayer);
      // setup IMA
      adPlayer.ima3({
        prerollTimeout: 5000,
        serverUrl: 'http://solutions.brightcove.com/croberts/tools/tags/vast.php'
      });
      // size it
      adPlayer.height(adPlayer.width()*9/16);
      // load the source
      adPlayer.src([
        {type: 'application/x-mpegUrl', src: asset.hlsUrl}
      ]);
      // play it
      adPlayer.play();
    });
  });

  // destroy the csai player if it exists, load the ssai one
  $('#load_ssai_btn').click(function() {
    $('#load_ssai_btn').attr('disabled', 'disabled');

    // destroy the player if it exists
    if (adPlayer) {
      adPlayer.dispose();
      adPlayer = null;
    }

    // and show the CSAI player
    var playerId = 'ad_player' + numPlayers++;
    var playerTemplate = '<video' + 
                         '  id="' + playerId + '"' +
                         '  data-account="1924997959001"' +
                         '  data-player="c800c858-444c-45d7-af6c-4ce98cd42a67"' +
                         '  data-embed="default"' +
                         '  width=100%' +
                         '  height=360px' +
                         '  class="video-js" controls></video>';

    // inject it
    var $player = $(playerTemplate);
    $('#player_holder').empty().append($player);
    bc($player[0]);
    videojs(playerId).ready(function() {
      adPlayer = this;
      console.log('SSAI player shown');
      console.log(asset);
      console.log(adPlayer);
      // size it
      adPlayer.height(adPlayer.width()*9/16);
      // prepare to play the video
      adPlayer.one('loadedmetadta', function() {
        adPlayer.play();
      });
      // setup OnceUX
      adPlayer.onceux({
        metadataUri: asset.metadataUri
      });
    });
  });

  // client side player
  // <video
  //   data-account="1924997959001"
  //   data-player="e311a371-5b48-4bf4-84cb-d1edf5a1eb4f"
  //   data-embed="default"
  //   class="video-js" controls></video>
  // <script src="//players.brightcove.net/1924997959001/e311a371-5b48-4bf4-84cb-d1edf5a1eb4f_default/index.min.js"></script>
 
  // server side player
  // <videso
  //   data-account="1924997959001"
  //   data-player="db827146-148c-4f72-9f62-e872bc3d7f7a"
  //   data-embed="default"
  //   class="video-js" controls></video>
  // <script src="//players.brightcove.net/1924997959001/db827146-148c-4f72-9f62-e872bc3d7f7a_default/index.min.js"></script>
 
});