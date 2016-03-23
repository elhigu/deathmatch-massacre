# Deathmatch Massacre (online demo http://elhigu.github.io/deathmatch-massacre/)

Hacked together JSNES (https://github.com/bfirsh/jsnes) and WebRTC a la PeerJS to create P2P multiplayer support to NES emulator.

<add video here>

## Uh what? How does it work? What is it exactly?

Peer.js allows to negotiate P2P WebRTC connection between browsers (without need to have own backend) and pass video and audio to slave browser and to read keypress events from slave browser to host. 

Since HTML5 canvas cannot act as a MediaSource we need to extract each frame separately for sending NES screen to slave. Host runs JSNES emulator and reads images from canvas rendered by JSNES, sends them thorugh WebRTC connection to slave machine which then renders them in to remote HTML5 canvas. Images are sent as base64 encoded png or jpeg strings.

![alt tag](http://elhigu.github.io/deathmatch-massacre/images/explain.jpg)

## Which browsers it supports? Where is the code?

Chrome seem to work fine. Needs keyboard for now, would be nice to have touch screen support, JSNES should run fine at least on some iPads.

Code is under `gh-pages` branch... it is so horrible that I didn't want to put it here. Feel free to browse from there. I have no idea which parts of JSNES was overridden... you might want to compare code with original JSNES branch.

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
- DTALES1.NES
- Duck Tales III (Duck Tales) [p1][!].nes
- DuckTales2.nes
- GAUNTL~1.NES
- GAUNTLET.NES
- Golf (JU).nes
- IKARI.NES
- IKARI2.NES
- Ikari3.nes
- Lemmings (U).nes
- Lifeforce (U).nes
- Mario Bros. (JU) [!].nes
- Mega Man (U).nes
- Mega Man 2 (Europe).nes
- Metroid (U) (PRG0) [!].nes
- Pac-Man (U) [!].nes
- Super Mario Bros. (JU) (PRG0) [!].nes
- Super Mario Bros. 3 (U) (PRG1) [!].nes
- Tennis (JU) [!].nes
- Tetris (U) [!].nes
- Tetris 2 (U) [!].nes
- Track & Field II (Europe).nes
- Zelda II - The Adventure of Link (U).nes

### Tested not to work

- BATTLETO.NES
- JACKAL.NES
- Monster Truck Rally (U) [!].nes
- RAINBOW.NES
- RAMPART.NES
- Track & Field in Barcelona (Europe).nes

