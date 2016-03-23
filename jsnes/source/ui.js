/*
JSNES, based on Jamie Sanders' vNES
Copyright (C) 2010 Ben Firshman

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

JSNES.DummyUI = function(nes) {
    this.nes = nes;
    this.enable = function() {};
    this.updateStatus = function() {};
    this.writeAudio = function() {};
    this.writeFrame = function() {};
};

if (typeof jQuery !== 'undefined') {
    (function($) {
        $.fn.JSNESUI = function(roms) {
            var parent = this;
            var UI = function(nes) {
                var self = this;
                self.nes = nes;

                self.nes.audio = {
                  ctx: new AudioContext()
                };
                /*
                 * Create UI
                 */
                self.otherStuff = $('#nes-other-stuff');
                self.screen = $('<canvas class="nes-screen" width="256" height="240"></canvas>').appendTo(parent);

                if (!self.screen[0].getContext) {
                    parent.html("Your browser doesn't support the <code>&lt;canvas&gt;</code> tag. Try Google Chrome, Safari, Opera or Firefox!");
                    return;
                }

                self.romContainer = $('<div class="nes-roms"></div>').appendTo(self.otherStuff);
                self.romSelect = $('<select></select>').appendTo(self.romContainer);

                self.controls = $('<div class="nes-controls"></div>').appendTo(self.otherStuff);
                self.buttons = {
                    pause: $('<input type="button" value="pause" class="nes-pause" disabled="disabled">').appendTo(self.controls),
                    restart: $('<input type="button" value="restart" class="nes-restart" disabled="disabled">').appendTo(self.controls),
                    sound: $('<input type="button" value="enable sound" class="nes-enablesound">').appendTo(self.controls),
                    zoom: $('<input type="button" value="zoom in" class="nes-zoom">').appendTo(self.controls)
                };
                self.status = $('<p class="nes-status">Booting up...</p>').appendTo(self.otherStuff);

                /*
                 * ROM loading
                 */
                self.romSelect.change(function() {
                    self.loadROM();
                });

                /*
                 * Buttons
                 */
                self.buttons.pause.click(function() {
                    if (self.nes.isRunning) {
                        self.nes.stop();
                        self.updateStatus("Paused");
                        self.buttons.pause.attr("value", "resume");
                    }
                    else {
                        self.nes.start();
                        self.buttons.pause.attr("value", "pause");
                    }
                });

                self.buttons.restart.click(function() {
                    self.nes.reloadRom();
                    self.nes.start();
                });

                self.buttons.sound.click(function() {
                    if (self.nes.opts.emulateSound) {
                        self.nes.opts.emulateSound = false;
                        self.buttons.sound.attr("value", "enable sound");
                    }
                    else {
                        self.nes.opts.emulateSound = true;
                        self.buttons.sound.attr("value", "disable sound");
                    }
                });

                self.zoomed = false;
                self.buttons.zoom.click(function() {
                    if (self.zoomed) {
                        self.screen.animate({
                            width: '256px',
                            height: '240px'
                        });
                        self.buttons.zoom.attr("value", "zoom in");
                        self.zoomed = false;
                    }
                    else {
                        self.screen.animate({
                            width: '512px',
                            height: '480px'
                        });
                        self.buttons.zoom.attr("value", "zoom out");
                        self.zoomed = true;
                    }
                });

                /*
                 * Lightgun experiments with mouse
                 * (Requires jquery.dimensions.js)
                 */
                if ($.offset) {
                    self.screen.mousedown(function(e) {
                        if (self.nes.mmap) {
                            self.nes.mmap.mousePressed = true;
                            // FIXME: does not take into account zoom
                            self.nes.mmap.mouseX = e.pageX - self.screen.offset().left;
                            self.nes.mmap.mouseY = e.pageY - self.screen.offset().top;
                        }
                    }).mouseup(function() {
                        setTimeout(function() {
                            if (self.nes.mmap) {
                                self.nes.mmap.mousePressed = false;
                                self.nes.mmap.mouseX = 0;
                                self.nes.mmap.mouseY = 0;
                            }
                        }, 500);
                    });
                }

                if (typeof roms != 'undefined') {
                    self.setRoms(roms);
                }

                /*
                 * Canvas
                 */
                self.canvasContext = self.screen[0].getContext('2d');

                if (!self.canvasContext.getImageData) {
                    parent.html("Your browser doesn't support writing pixels directly to the <code>&lt;canvas&gt;</code> tag. Try the latest versions of Google Chrome, Safari, Opera or Firefox!");
                    return;
                }

                self.canvasImageData = self.canvasContext.getImageData(0, 0, 256, 240);
                self.resetCanvas();

            };

            UI.prototype = {
                loadROM: function() {
                    // cors free rom linking...
                    var self = this;
                    self.updateStatus("Downloading...");
                    fetch(encodeURI(self.romSelect.val()), {
                      mode: 'no-cors',
                      redirect: 'manual'
                    })
                    .then(response => response.blob())
                    .then(blob => {
                      console.log("Response.blob()", blob);
                      var reader = new FileReader();
                      reader.onload = function (loadEvent) {
                        console.log("Got the data", loadEvent, loadEvent.target.result.slice(0,256));
                        var isValid = self.nes.loadRom(loadEvent.target.result);
                        console.log("Rom status:", isValid);
                        self.nes.start();
                        self.enable();
                        uiCallbacks.gameStart();
                      }
                      console.log("Loading rom....")
                      reader.readAsText(blob, 'x-user-defined');
                    });
                },

                resetCanvas: function() {
                    this.canvasContext.fillStyle = 'black';
                    // set alpha to opaque
                    this.canvasContext.fillRect(0, 0, 256, 240);

                    // Set alpha
                    for (var i = 3; i < this.canvasImageData.data.length-3; i += 4) {
                        this.canvasImageData.data[i] = 0xFF;
                    }
                },

                /*
                *
                * nes.ui.screenshot() --> return <img> element :)
                */
                screenshot: function() {
                    var data = this.screen[0].toDataURL("image/png"),
                        img = new Image();
                    img.src = data;
                    return img;
                },

                /*
                 * Enable and reset UI elements
                 */
                enable: function() {
                    this.buttons.pause.attr("disabled", null);
                    if (this.nes.isRunning) {
                        this.buttons.pause.attr("value", "pause");
                    }
                    else {
                        this.buttons.pause.attr("value", "resume");
                    }
                    this.buttons.restart.attr("disabled", null);
                    if (this.nes.opts.emulateSound) {
                        this.buttons.sound.attr("value", "disable sound");
                    }
                    else {
                        this.buttons.sound.attr("value", "enable sound");
                    }
                },

                updateStatus: function(s) {
                    this.status.text(s);
                },

                setRoms: function(roms) {
                    this.romSelect.children().remove();
                    $("<option>Select a ROM...</option>").appendTo(this.romSelect);
                    for (var groupName in roms) {
                        if (roms.hasOwnProperty(groupName)) {
                            var optgroup = $('<optgroup></optgroup>').
                                attr("label", groupName);
                            for (var i = 0; i < roms[groupName].length; i++) {
                                $('<option>'+roms[groupName][i][0]+'</option>')
                                    .attr("value", roms[groupName][i][1])
                                    .appendTo(optgroup);
                            }
                            this.romSelect.append(optgroup);
                        }
                    }
                },

                lastTime: 0,
                glichStopper: null,
                lowpass: null,
                writeAudio: function(samples, leftFloatSamples, rightFloatSamples) {
                  var self = this;
                  var ctx = self.nes.audio.ctx;

                  // dirty hack to reduca sound gliches a bit
                  // emulator is launching audio buffers too fast and very unstable rate
                  // so we play them a bit faster and try to prevent zerogliches
                  // by filling data with last seen value between samples...
                  if (!self.glichStopper) {
                    var lastL = 0;
                    var lastR = 0;
                    self.glichStopper = ctx.createScriptProcessor(0,2,2);
                    self.glichStopper.onaudioprocess = function(audioProcessingEvent) {
                      var inputDataL = audioProcessingEvent.inputBuffer.getChannelData(0);
                      var inputDataR = audioProcessingEvent.inputBuffer.getChannelData(1);
                      var outputDataL = audioProcessingEvent.outputBuffer.getChannelData(0);
                      var outputDataR = audioProcessingEvent.outputBuffer.getChannelData(1);

                      for (i=0;i<audioProcessingEvent.inputBuffer.length;i++) {
                        if (inputDataL[i] != 0) lastL = inputDataL[i];
                        if (inputDataR[i] != 0) lastR = inputDataR[i];
                        outputDataL[i] = lastL;
                        outputDataR[i] = lastR;
                      }
                    };

                    self.lowpass = ctx.createBiquadFilter();
                    self.lowpass.type = "lowpass";
                    self.lowpass.frequency.value = 9000;

                    self.glichStopper.connect(self.lowpass);
                    self.lowpass.connect(self.nes.audio.ctx.destination);

                    var remoteStream = self.nes.audio.remoteStream;
                    if (remoteStream) {
                      self.lowpass.connect(remoteStream);
                    }
                  }
                  // calcute millisecond how fast thing should be played..
                  var timeNow = new Date().getTime();
                  var playLength = timeNow - self.lastTime;
                  self.lastTime = timeNow;

                  var buffer = ctx.createBuffer(2, leftFloatSamples.length, ctx.sampleRate);
                  var source = ctx.createBufferSource();
                  source.buffer = buffer;
                  source.playbackRate.value = 1.07;
                  var l = buffer.getChannelData(0);
                  var r = buffer.getChannelData(1);
                  l.set(leftFloatSamples);
                  r.set(rightFloatSamples);
                  source.connect(self.glichStopper);

                  // send audio to postprocessing
                  source.start();
                },

                writeFrame: function(buffer, prevBuffer) {
                    var imageData = this.canvasImageData.data;
                    var pixel, i, j;

                    for (i=0; i<256*240; i++) {
                        pixel = buffer[i];

                        if (pixel != prevBuffer[i]) {
                            j = i*4;
                            imageData[j] = pixel & 0xFF;
                            imageData[j+1] = (pixel >> 8) & 0xFF;
                            imageData[j+2] = (pixel >> 16) & 0xFF;
                            prevBuffer[i] = pixel;
                        }
                    }

                    this.canvasContext.putImageData(this.canvasImageData, 0, 0);
                    uiCallbacks.newFrame(this);
                }
            };

            return UI;
        };
    })(jQuery);
}
