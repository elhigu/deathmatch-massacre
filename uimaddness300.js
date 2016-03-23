$(function() {
  var emulatorContainer = $('.emulator-container');
  var hostEmulator = $('#emulator');
  var slaveEmulator = $('#emulator-slave');
  var hostOptions = $('.host-options');
  var joinOptions = $('.join-options');
  var information = $('.information');

  var containerLander = $('#container-lander');
  var containerGame = $('#container-game');
  var footer = $('.footer');

  function setState(state) {
    containerLander.hide();
    containerGame.show();
    footer.hide();
    information.hide();

    switch(state) {
      case 'join':
        emulatorContainer.show();
        hostEmulator.hide();
        slaveEmulator.show();
        joinOptions.show();
        hostOptions.hide();
        break;
      case 'host':
        emulatorContainer.show();
        hostEmulator.show();
        slaveEmulator.hide();
        joinOptions.hide();
        hostOptions.show();
        break;
      default:
        emulatorContainer.hide();
    }

    // hide rom select box if no roms in list
    if ($('.nes-roms select option').length < 2) {
      $('.nes-roms').hide();
    } else {
      $('.nes-roms').show();
    }
  }

  $('.join-game').click(function () {
    setState('join');
  });

  $('.host-game').click(function () {
    setState('host');
  });

});
