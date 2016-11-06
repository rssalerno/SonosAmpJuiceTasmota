# SonosAmpJuicePi

## Purpose
The purpose of this application is to turn power off and on at the mains for centrally-located amplifiers/receivers, based on Sonos activity and using GPIO pins on the Raspberry Pi connected to relays (such as the PowerSwitch Tail).

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

## Pre-composed raspberry pi image
  - Download URL: https://github.com/geeeyetee/SonosAmpJuicePi/releases/download/v1.0/SonosAmpJuicePi.img.gz
  - Windows users, you can extract the .img file from this .gz archive using the free 7zip application.
  - This is a ready-to-run image for Raspberry Pi 2 (it should also work on Pi B/B+ and 3).
  - The image is clumsily adapted the one Jimmy Shimizu links to from https://jishi.github.io/node-sonos-http-api/, so here are helpful instructions lifted from the same page:
  
>   - By default the root user has no password, if you want to set a password, just SSH to that machine and set a new root password.
>   - It also has samba installed by default, and sharing the /flash folder with read/write permissions for easier access. Just visit \\sonos from a windows machine or smb://sonos from macOS (replace sonos with the IP if it doesn't work).
>   - To write the image to an SD-card, use the`dd` command on Linux and OS X, or Win32DiskWriter on Windows.

### How to reset host keys (important security instructions from Jishi)
>   - I don't recall exact folder where these reside, but I think this is it:

```
rm /etc/sshd/ssh_host_*
lbu_commit
```

>   - It will generate new keys upon reboot now.
>   - After rebooting, login and run lbu_commit again

  - Set up your room names etc. as specified above by editing `\\sonos\flash\apps\SonosAmpJuicePi\app.js` / `smb://sonos/flash/apps/SonosAmpJuicePi\app.js`
  - Then restart the Pi and wait a few minutes for network discovery to complete.
  - To troubleshoot, open the latest file in `\\sonos\flash\logs` / `smb://sonos/flash/logs`.

## Acknowledgement
This is a trivial hack with a result that its author finds incredibly useful. It only exists because of the yeoman's work done by Jimmy Shimizu (https://github.com/jishi/). Thank you, Jimmy!!!
