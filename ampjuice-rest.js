'use strict';

const justTesting = false;
const stopTimeout = 60000; // in ms, delay between learning that an amp can be turned off and doing so

var amps = { 
  "Pool": { tasmotaHost: "TASMOTA_SWITCH_1_HOSTNAME_OR_URL", stopTimer: null },
  "Deck": { tasmotaHost: "TASMOTA_SWITCH_2_HOSTNAME_OR_URL", stopTimer: null }
}
var logsPath = justTesting ? './logs/' : './logs/';
var winston = require('winston');
// log levels:  error, warn, info, verbose, debug, silly
// maxSize * maxFiles = total storage logs may use (in bytes)
var logger = winston.createLogger({
  transports: [
	/*
    new (winston.transports.Console)({ 
      level: 'info', 
      timestamp: true,
			prettyPrint: true,
			colorize: true
    }),
		*/
    new (winston.transports.File)({ 
      level: 'info', 
      timestamp: true, 
      maxsize: 1000000, 
      maxFiles: 50,
      filename: logsPath + 'AppLog.txt', 
			prettyPrint: true,
      json: false
    })
  ]
});
var discoveryModuleLogger = winston.createLogger({
  transports: [
	/*
    new (winston.transports.Console)({
      level: 'warning', 
      timestamp: true,
      prettyPrint: true,
      colorize: true 
    }),
	*/
    new (winston.transports.File)({ 
      level: 'warn', 
      timestamp: true, 
      maxsize: 1000000, 
      maxFiles: 50,
      filename: logsPath + 'DiscoveryModuleLog.txt', 
      json: false 
    })
  ]
});
console.log = function() {};

logger.info("Starting app.");
 
var debounce = require('throttle-debounce/debounce');

var SonosDiscovery = require('sonos-discovery');
var discoverySettings = {
    household: null,
    log: discoveryModuleLogger
  };
var discovery = new SonosDiscovery(discoverySettings);
logger.debug('START discovery');
logger.debug(discovery);
logger.debug('END discovery');

var request;
if (!justTesting) {
  request = require('request');
}

var roomNames = Object.keys(amps);

for (var i = 0; i != roomNames.length; i++) {
	var roomName = roomNames[i];
	var amp = amps[roomName];
	logger.info(roomName + ': Ensuring amp is off at app startup (Tasmota host: ' + amp.tasmotaHost + ').');
  if (!justTesting) {
    // Set Tasmota switch initial state to off
    request("http://" + amp.tasmotaHost + "/cm?cmnd=Power%20off", { json: true }, (err, res, body) => {
      if (err) { return console.log(err); }
      console.log(body.url);
      console.log(body.explanation);
    });
  }
}

// Wait a quick beat in case of multiple events firing together, then fire on the last of them
var juiceTheAmps = debounce(100, function (discovery) {
	logger.debug('debounced function juiceTheAmps() called');
	/*
	
	Example discovery.players with irrelevent properties removed and UUIDs replaced with English.

	- Master Bathroom is operating independently:
	
	RINCON_MASTER_BATHROOM:
		{ 
			roomName: 'Master Bathroom',
			uuid: 'RINCON_MASTER_BATHROOM',
			state:
			 { 
				 volume: 69,
				 mute: false,
				 currentState: 'PLAYING'
			 },
			coordinator: { '$ref': '$["players"]["RINCON_MASTER_BATHROOM"]' },
			groupState: { volume: 69, mute: false }
		},

	- Master Bedroom is coordinating Living Room:

	RINCON_MASTER_BEDROOM:
		{ 
			roomName: 'Master Bedroom',
			uuid: 'RINCON_MASTER_BEDROOM',
			state:
			{ 
				volume: 39,
				mute: false,
				currentState: 'PAUSED_PLAYBACK'
			},
			coordinator: { uuid: 'RINCON_MASTER_BEDROOM' }
			groupState: { volume: 51, mute: false } <-- groupState IS ONLY ACCURATE FOR coordinator
		},
	
	RINCON_LIVING_ROOM:
		{ 
			roomName: 'Living Room',
			uuid: 'RINCON_LIVING_ROOM',
			state:
			 { 
				 volume: 63,
				 mute: false,
				 currentState: 'PLAYING' <-- THIS IS IRRELEVANT; SEE coordinator
			 },
			coordinator:
			 { 
				 roomName: 'Master Bedroom',
				 uuid: 'RINCON_MASTER_BEDROOM',
				 state:
					{ 
						volume: 39,
						mute: false,
						currentState: 'PAUSED_PLAYBACK'
					},
				 coordinator: { uuid: 'RINCON_MASTER_BEDROOM' }
				 groupState: { volume: 51, mute: false } <-- groupState IS ONLY ACCURATE FOR coordinator
			 }
		}
			 
	*/
	
	/*
	logger.debug('START discovery');
	logger.debug(discovery);
	logger.debug('END discovery');
	logger.debug('START discovery.players');
	logger.debug(discovery.players);
	logger.debug('END discovery.players');
	logger.debug(`discovery.players.length: ${discovery.players.length}`);
	*/
	
	var uuids = Object.keys(discovery.players);
	for(var i = 0, length = uuids.length; i < length; i++ ) {
		var player = discovery.players[uuids[i]];;
		if (!player) {
			logger.warn(`discovery.players[${uuids[i]}]:`);
			logger.warn(discovery.players[uuids[i]]);
			continue;
		}
		var amp = amps[player.roomName];
		if (!amp) {
			logger.warn(`Discovered a player ("${player.roomName}") for which no amp is configured`);
			continue;
		}
		logger.debug(`player.roomName: ${player.roomName}`);
		logger.debug(`player.coordinator.state.currentState: ${player.coordinator.state.currentState}`);
		logger.debug(`player.state.volume: ${player.state.volume}`);
		logger.debug(`player.state.mute: ${player.state.mute}`);
		logger.debug(`player.coordinator.groupState.volume: ${player.coordinator.groupState.volume}`);
		logger.debug(`player.coordinator.groupState.mute: ${player.coordinator.groupState.mute}`);
		var giveItJuice =
			(player.coordinator.state.currentState == 'PLAYING') &&
			player.state.volume && 
			!player.state.mute &&
			player.coordinator.groupState.volume &&
			!player.coordinator.groupState.mute;
		logger.debug(`giveItJuice: ${giveItJuice}`);
		if (giveItJuice) {
			logger.info(`${player.roomName}: player is playing and not muted; cancelling any stop timer`);
			clearTimeout(amp.stopTimer);
			logger.info(`${player.roomName}: turning/keeping amp on (Tasmota host: ${amp.tasmotaHost})`);
			if (!justTesting) {
				request("http://" + amp.tasmotaHost + "/cm?cmnd=Power%20on", { json: true }, (err, res, body) => {
      				if (err) { return console.log(err); }
    				  console.log(body.url);
    				  console.log(body.explanation);
    				});
			}
		} else {
			logger.info(`${player.roomName}: player is stopped (or muted); starting a timer to turn amp off`);
			clearTimeout(amp.stopTimer);
			var roomNameVal = player.roomName.valueOf();
			amp.stopTimer = setTimeout(stopHandler, stopTimeout, roomNameVal);
		}
	}
});

logger.info("Setting up transport-state event");
discovery.on('transport-state', transportStateChangeHandler);
logger.info("Finished setting up transport-state event");

logger.info("Setting up group-volume event");
discovery.on('group-volume', groupVolumeChangeHandler);
logger.info("Finished setting up group-volume event");

logger.info("Setting up group-mute event");
discovery.on('group-mute', groupMuteChangeHandler);
logger.info("Finished setting up group-mute event");

logger.info("Setting up volume event");
discovery.on('volume', volumeChangeHandler);
logger.info("Finished setting up volume event");

logger.info("Setting up mute event");
discovery.on('mute', muteChangeHandler);
logger.info("Finished setting up mute event");

function transportStateChangeHandler(data) {
  logger.debug('transport-state event fired');
  juiceTheAmps(discovery);
}

function groupVolumeChangeHandler(data) {
  logger.debug('group-volume event fired');
  // data.uuid,
  // data.groupState,
  // data.playerVolumes
  juiceTheAmps(discovery);
}

function groupMuteChangeHandler(data) {
  logger.debug('group-mute event fired');
  // from sonos-discovery package:
  // discovery.emit('group-mute', {uuid: _this.uuid, state: _this.groupState});
  juiceTheAmps(discovery);
}

function volumeChangeHandler(data) {
  logger.debug('volume event fired');
  // from sonos-discovery package:
  // discovery.emit('volume', {uuid: _this.uuid, state: _this.getState()});
  juiceTheAmps(discovery);
}

function muteChangeHandler(data) {
  logger.debug('mute event fired');
  // from sonos-discovery package:
  // discovery.emit('mute', {uuid: _this.uuid, state: _this.getState()});
  juiceTheAmps(discovery);
}

function stopHandler(roomNameParam) {
  logger.info(`${roomNameParam}: player stopped/muted at least ${stopTimeout / 1000} seconds; turning amp off (Tasmota host: ${amps[roomNameParam].tasmotaHost})`);
  if (!justTesting) {
    request("http://" + amps[roomNameParam].tasmotaHost + "/cm?cmnd=Power%20off", { json: true }, (err, res, body) => {
      if (err) { return console.log(err); }
      console.log(body.url);
      console.log(body.explanation);
    });
  }
}
