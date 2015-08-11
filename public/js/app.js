$(function() {
  // need to remember our players and the asset
  var asset,  
      createAssetTime, 
      assetIngestedTime, 
      numPlayers = 0;

  // handle callbacks
  var socket = io.connect();
  socket.on('connections', function(data) {
    log(data);
  });
  socket.on('video_published', function(data) {
    log('Video published!');
    log(data);
    assetIngestedTime = Date.now();
    // do something with amount of time it took to ingest it
  });
  socket.on('asset_created', function(data) {
    log('asset_created');
    log(data);
  });

  // handle resizes
  $csaiFrame = $('#csai_frame');
  $csaiFrame.height($csaiFrame.width()*9/16);
  $ssaiFrame = $('#ssai_frame');
  $ssaiFrame.height($ssaiFrame.width()*9/16);
  $(window).resize(function(event) {
    $csaiFrame.height($csaiFrame.width()*9/16);
    $ssaiFrame.height($ssaiFrame.width()*9/16);
  });

  // party starts when the user clicks create
  $('#start_btn').click(function() {
    $('#start_btn').attr('disabled', 'disabled');
    // make our call
    var data = {
      asset: {
        foreignKey: guid(),
        mezzanine: $('#mezz_input').val(),
        hlsUrl: $('#hls_input').val(),
        name: 'Test ' + Date.now(),
        description: 'Test for CSAI vs SSAI'
      }
    }

    $.ajax({
      type: 'POST',
      url: '/assets',
      data: JSON.stringify(data),
      contentType: 'application/json',
      success: function(data, textStatus, xhr) {
        createAssetTime = Date.now();
        if (xhr.status === 201) {
          asset = data;
          $('#load_csai_btn').removeAttr('disabled');
        }
        else {
          console.log('wtf?');
        }
      }
    });
  });

  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  }

  // special logging because slightly lazy
  function log(data) {
    console.log('app.js');
    console.log(data);
  }

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