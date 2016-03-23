# Deathmatch Massacre

Forced together JSNES (https://github.com/bfirsh/jsnes) and WebRTC a la PeerJS to create P2P multiplayer support to NES emulator.

## Uh what? How does it work? What is exactly?

JSNES and Peer.js is the core of this hack.

Peer.js allows to negotiate P2P WebRTC connection between browsers and pass video and audio to slave browser and to read keypress events from slave browser to host. 

Since canvas cannot act as a MediaSource we need to extract each frame separately for sending NES screen to slave. Host runs JSNES emulator and reads images from canvas rendered by JSNES, sends them thorugh WebRTC connection to slave machine which then renders them in remote side. Images are sent as base64 encoded png or jpeg strings.

  

## Vincit hackfest 2015 project

Idea was hack together something awesome in 24h... Actually this one was running with horrible sound quality and without options for remote connection to change image quality already around 10h mark.

Later on sounds were fixed to be played through HTML5 AudioContext and passed as WebRTC media stream to slave browser. Also option to read ROM from file was added to be able to publish this at somewhat legal manner in github.

### OK What is Hackfest?

Event held @ Vincit once a year where employees gather for a weekend to some cottage like environment to relax with sauna and hottubs. Second day there is friendly 24h competition to build something that one finds interesting. 

## Which ROMS are working?

Feel free to add rom name to list if you have tested it.

- Bubble Bobble (U).nes
- CHIPDALE.nes
- Contra (U) [!].nes
- Donkey Kong (JU).nes
- Dr. Mario (JU).nes
- JurassicPark.nes
- Legend of Zelda, The (U) (PRG1).nes
- Joe & Mac - Caveman Ninja (Europe).nes
- Bomberman II (USA).nes
- Bomberman.nes
- Bubble Bobble (U).nes
- CHIPDALE.NES

### Tested not to work

- BATTLETO.NES
- 
