# SonosAmpJuiceTasmota

## Purpose
The purpose of this pair of applications is to turn power off and on at  amplifiers/receivers, based on monitoring Sonos activity, using MQTT or REST to control inexpensive WiFi switches flashed with Tasmota (such as the Sonoff Basic and Gosund Power Plug).

## Configuration
  - Edit the `stopTimeout` variable if you want to change the delay between when the application learns that an amp can be turned off and when it does so.
  - Change the value of the `justTesting` variable to `true` if you want to test the application without triggering a WiFi switch (by running node and watching log files and/or command-line output).

## ampjuice-mqtt.js
  - Edit the `amps` variable to associate each of your sonos player/room names with the MQTT topic corresponding to the Tasmota device for that player or room name.
  - Edit the `mqtt.connect` URL to point to your MQTT broker.  Edit `username` and `password` if your MQTT broker requires authentication.
  
## ampjuice-rest.js
  - Edit the `amps` variable to associate each of your sonos player/room names with the IP address/hostname of the Tasmota device for that player or room name.

## Notes
  - Responds appropriately to grouping, ungrouping, muting, pausing, stopping, playing, turning the volume all the way down to zero, and increasing the volume from zero
  - Controls each player's amplifier as appropriate, whether or not it is currently part of a group
  - Turns amplifiers on instantly when they are needed; turns them off after `stopTimeout` when they are not. `stopTimeout` will reset while users are making any additional changes such as pausing or starting and adjusting volume.
  - Runs on any host running node.js.  Runs reliably and long-term on a Raspberry Pi 2
  - Does not account for setups that include the Sonos Sub or Playbar, or that use stereo pairing (using one player for the left channel and another for the right)
  - A player's amplifier may turn on upon being added to a group even when the group is not playing anything. It will turn off after `stopTimeout` if the group does not begin playing something in the meantime.

## Acknowledgement
Forked from https://github.com/geeeyetee/SonosAmpJuicePi which is based on work done by Jimmy Shimizu (https://github.com/jishi/). Thank you for your inspiration.

## More
[Announcement post](https://en.community.sonos.com/  TBD
