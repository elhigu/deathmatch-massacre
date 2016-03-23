var nes;
var slaveCanvas;
var slaveCanvasCtx;
var peer = new Peer({ key: 'd5s5b14v04lvj9k9', debug: 3});
var slave = null;
var slaveAudio = null;
var host = null;
var hostAudio = null;
var audioDestinationStream = null;

var player2KeyCodeMap = {
  88: 103,
  89: 105,
  90: 105,
  17: 99,
  13: 97,
  38: 104,
  40: 98,
  37: 100,
  39: 102
};

peer.on('open', function(){
  console.log("My id", peer.id);
  $('#my-id').text(peer.id);
});

var compression = "png";
var quality = 1;
peer.on('connection', function(conn) {
  if (slave) {
    conn.close(); // if connection already establihed, just deny
  } else {
    slave = conn;
    conn.on('close', function () {
      slave = null;
      if (slaveAudio) {
        slaveAudio.close();
        slaveAudio = null;
      }
    });
    conn.on('data', function (event) {
      if (event.type === 'keydown') {
        nes.keyboard.keyDown({keyCode: event.key});
      }
      if (event.type === 'keyup') {
        nes.keyboard.keyUp({keyCode: event.key});
      }
      if (event.type === 'keypress') {
        nes.keyboard.keyPress({keyCode: event.key});
      }
      if (event.type === 'quality') {
        var sliced = event.data.split("/");
        compression = sliced[0];
        quality = parseFloat(sliced[1]);
        $("#quality").text(event.data);
      }
    });
  }
});

peer.on('call', function(conn) {
  if (slaveAudio) {
    conn.close(); // if connection already established, just deny
  } else {
    slaveAudio = conn;
    slaveAudio.on('error', function (err) {
      console.log("Host side: Error on host -> slave audio connection", err);
    });
    conn.on('close', function () {
      slaveAudio = null;
    });
    conn.on('stream', function (stream) {
      console.log("Got Stream from slave:", stream);
    });
    // stream to send audio to slave...
    console.log("Output stream", audioDestinationStream.stream);
    conn.answer(audioDestinationStream.stream);
  }
});

var frameCounter = 0;
var musickbits = 0;

var uiCallbacks = {
  gameStart : function () {
  },
  newFrame : function (ui) {
    frameCounter++;
    if (slave && (frameCounter%3 == 0)) {
      var dataUrl = ui.screen[0].toDataURL("image/" + compression, quality);
      if (frameCounter%60 == 0) {
        var imageBandwidth = parseInt(dataUrl.length*20*8/1024);
        $('#image_bandwidth').text(imageBandwidth + " kbit/s");
        $('#music_bandwidth').text(musickbits + " kbit/s");
        $('#bandwidth').text(imageBandwidth + musickbits + " kbit/s");
      }
      slave.send({ type: 'frame', data: dataUrl });
    }
  }
};

var connectToHost = function (hostId) {
  if (host) {
    host.close();
    if (hostAudio) {
      hostAudio.close();
    }
  }
  host = peer.connect(hostId);
  host.on('open', function () {
    // connect audio stream
    var audioDestStream = nes.audio.ctx.createMediaStreamDestination();
    console.log("Sending stream to slave -> host", audioDestStream.stream);
    hostAudio = peer.call(hostId, audioDestStream.stream);

    hostAudio.on('error', function (err) {
      console.log("Slave side: Error on slave -> host audio connection", err);
    });

    function playStream(stream) {
      // this is crap... but this seem to play stream, even that
      var audio = $('<audio autoplay />').appendTo('body');
      audio[0].src = (URL || webkitURL || mozURL).createObjectURL(stream);

      // this doesnt work... maybe needs some opus decoder there or something...
      // var audioSourceStream = nes.audio.ctx.createMediaStreamSource(stream);
      // audioSourceStream.connect(nes.audio.ctx.destination);
    }

    hostAudio.on('stream', function (stream) {
      console.log("Receiving stream from host -> slave... connecting to speakers", stream);
      playStream(stream);
    });
  });

  var myCanvas = document.getElementById('my_canvas_id');
  var img = new Image();
  var loading = false;

  img.onload = function() {
    slaveCanvasCtx.drawImage(img, 0, 0);
    loading = false;
  };

  host.on('data', function (data) {
    if (data.type === 'frame') {
      if (!loading) {
        img.src = data.data;
        loading = true;
      }
    }
  });
};

$(function() {
  nes = new JSNES({
    'ui': $('#emulator').JSNESUI({
/*
      "Rom links": [
        ['Contra', 'https://fir.sh/projects/jsnes/roms/Contra (U) [!].nes'],
        ['Index.html', 'https://www.google.fi/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png']
      ],
      "Working": [
        ['Bubble Bobble', 'local-roms/Bubble Bobble (U).nes'],
        ['Chip & Dale', 'local-roms/CHIPDALE.nes'],
        ['Contra', 'local-roms/Contra (U) [!].nes'],
        ['Donkey Kong', 'local-roms/Donkey Kong (JU).nes'],
        ['Dr. Mario', 'local-roms/Dr. Mario (JU).nes'],
        ['Ducktales', 'local-roms/DTALES1.nes'],
        ['Ducktales 2', 'local-roms/DuckTales2.nes'],
        ['Ducktales 3', 'local-roms/Duck Tales III (Duck Tales) [p1][!].nes'],
        ['Golf', 'local-roms/Golf (JU).nes'],
        ['Joe & Mac', 'local-roms/Joe & Mac - Caveman Ninja (Europe).nes'],
        ['Jurassic Park', 'local-roms/JurassicPark.nes'],
        ['The Legend of Zelda', 'local-roms/Legend of Zelda, The (U) (PRG1).nes'],
        ['Lemmings', 'local-roms/Lemmings (U).nes'],
        ['Lifeforce', 'local-roms/Lifeforce (U).nes'],

        ['Mario Bros.', 'local-roms/Mario Bros. (JU) [!].nes'],
        ['Mega Man', 'local-roms/Mega Man (U).nes'],
        ['Mega Man 2', 'local-roms/Mega Man 2 (Europe).nes'],
        ['Pac-Man', 'local-roms/Pac-Man (U) [!].nes'],
        ['Super Mario Bros.', 'local-roms/Super Mario Bros. (JU) (PRG0) [!].nes'],
        ['Tennis', 'local-roms/Tennis (JU) [!].nes'],
        ['Tetris', 'local-roms/Tetris (U) [!].nes'],
        ['Tetris 2', 'local-roms/Tetris 2 (U) [!].nes'],
        ['Track & Field 2', 'local-roms/Track & Field II (Europe).nes'],
        ['Zelda II - The Adventure of Link', 'local-roms/Zelda II - The Adventure of Link (U).nes'],
        ['Bomberman II', 'local-roms/Bomberman II (USA).nes']
      ],

      "Nearly Working": [
        ['Duck Hunt', 'local-roms/Duck Hunt (JUE) [!].nes'],
        ['Super Mario Bros. 3', 'local-roms/Super Mario Bros. 3 (U) (PRG1) [!].nes']
      ]
*/
    })
  });
  nes.opts.emulateSound = true;

  audioDestinationStream = nes.audio.ctx.createMediaStreamDestination();
  nes.audio.remoteStream = audioDestinationStream;

  $('#loadrom').change(function () {
    console.log("File input changed!", this);
    var romFile = this.files[0];
    var reader = new FileReader();
    reader.onload = function (loadEvent) {
      console.log("Got the data", loadEvent, loadEvent.target.result.slice(0,256));
      var isValid = nes.loadRom(loadEvent.target.result);
      console.log("Rom status:", isValid);
      nes.start();
      nes.ui.enable();
      uiCallbacks.gameStart();
    }
    console.log("Loading rom....")
    reader.readAsText(romFile, 'x-user-defined');
  });

  $("input[name='video-quality']").click(function(){
    if (host) {
      host.send({ type: 'quality', data: $('input:radio[name=video-quality]:checked').val() })
    }
  });

  var hostIdField = $('#hostid');
  var connectButton = $('#connect').click(function () {
    connectToHost(hostIdField.val());
  });
  slaveCanvas = $('.slave-canvas')[0];
  slaveCanvasCtx = slaveCanvas.getContext('2d');

  // Keyboard event passing to connect input field or if not focused to
  // emulator and to host if connection exists
  $(document).bind('keydown', function (evt) {
    if ($('#hostid:focus').length > 0) {
      return;
    } else {
      if (host) {
        host.send({type: 'keydown', key: player2KeyCodeMap[evt.keyCode]});
      }
      nes.keyboard.keyDown(evt);
    }
  });

  $(document).bind('keyup', function (evt) {
    if ($('#hostid:focus').length > 0) {
      return;
    } else {
      if (host) {
        host.send({type: 'keyup', key: player2KeyCodeMap[evt.keyCode]});
      }
      nes.keyboard.keyUp(evt);
    }
  });

  $(document).bind('keypress', function (evt) {
    if ($('#hostid:focus').length > 0) {
      return;
    } else {
      if (host) {
        host.send({type: 'keypress', key: player2KeyCodeMap[evt.keyCode]});
      }
      nes.keyboard.keyPress(evt);
    }
  });
});
