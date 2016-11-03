# SonosAmpJuicePi

## Purpose
The purpose of this application is to turn power off and on at the mains for centrally-located amplifiers/receivers, using GPIO pins on the Raspberry Pi connected to relays (such as the PowerSwitch Tail).

## App.js
  - Edit the `amps` variable to associate each of your sonos player/room names with a GPIO physical pin number (which you in turn have connected to a relay that controls power to the corresponding amplifier).
  - Edit the `stopTimeout` variable if you want to change the delay between when the application learns that an amp can be turned off and when it does so.
  - Change the value of the `justTestingOnSomeDeviceThatLacksGpio` variable to `true` if you want to test the application on your PC (by running node and watching log files and/or command-line output).

## Notes
  - Responds appropriately to grouping, ungrouping, muting, pausing, stopping, playing, turning the volume all the way down to zero, and increasing the volume from zero
  - Controls each player's amplifier as appropriate, whether or not it is currently part of a group
  - Turns amplifiers on instantly when they are needed; turns them off after `stopTimeout` when they are not. `stopTimeout` will reset while users are making any additional changes such as pausing or starting and adjusting volume.
  - Runs reliably and long-term on the author's Raspberry Pi 2
  - Does not account for setups that include the Sonos Sub or Playbar, or that use stereo pairing (using one player for the left channel and another for the right)
  - A player's amplifier may turn on upon being added to a group even when the group is not playing anything. It will turn off after `stopTimeout` if the group does not begin playing something in the meantime.

## SonosAmpJuicePi.img.gz
  - This is a ready-to-run image for Raspberry Pi 2, adapted from the one at https://github.com/jishi/node-sonos-http-api/releases/download/v1.0.1/sonos-http-api-1.0.1.img.gz.
  - Files are exposed over the network via shares (Samba a.k.a SMB a.k.a. UNC), so you may not ever need to SSH into it (but note that root has no password and change that as appropriate for your setup!).
  - Set up your room names etc. as specified above by editing `\\sonos\flash\apps\SonosAmpJuicePi\app.js`.
  - See what is going on by opening the latest file in `\\sonos\flash\logs`.

## Acknowledgement
This is a trivial hack with a result that its author finds incredibly useful. It only exists because of the yeoman's work done by Jimmy Shimizu (https://github.com/jishi/). Thank you, Jimmy!!!
