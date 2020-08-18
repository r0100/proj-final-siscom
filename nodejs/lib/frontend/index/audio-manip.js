const {amiqdemod, fmiqdemod, lsbiqdemod, usbiqdemod} = require('../../demodulators');

'use strict'

const AUDIO = '/audio';
const LPF = 1000;
const NO_FILTER = 25000;
const BUFFER_SIZE = 4096;

let ctx;
let source;
let demod;
let filter;


module.exports = {
	ctx: ctx,
	LPF: LPF,
	NO_FILTER: NO_FILTER,
	initAudio: initAudio,
	playPause: playPause,
	demodFunc: demodFunc
}

function demodFunc(iq) {return fmiqdemod(iq, [1])}

function initAudio() {
	let audioContext = window.AudioContext||window.webkitAudioContext;
	ctx = new AudioContext();
	source = ctx.createBufferSource();
	demod = ctx.createScriptProcessor(BUFFER_SIZE, 2, 2);
	filter = ctx.createBiquadFilter();
	filter.type = 'lowpass';
	filter.gain.value = 0.5;
	filter.frequency.value = NO_FILTER;

	function getAudio() {
		req = new XMLHttpRequest();
		req.open('GET', AUDIO, true);
		req.responseType = 'arrayBuffer';
		req.onload = function() {
			let audioData = req.response;
			ctx.decodeAudioData(audioData, function(buffer) {
				myBuffer = buffer;
				source.buffer = myBuffer;
			}), function(e) {console.log("ERROR DECODING AUDIO: " + e.err)}
		}
		req.send();
	}

	demod.onaudioprocess = function(audioProcessingEvent) {
		let inputBuffer = audioProcessingEvent.inputBuffer;
		let outputBuffer = audioProcessingEvent.outputBuffer;

		let iq = [inputBuffer.getChannelData(0), inputBuffer.getChannelData(1)];
		let y = demodFunc(iq);
		console.log(y[0].length);
		let outData = [outputBuffer.getChannelData(0), outputBuffer.getChannelData(1)];
		for(let i = 0; i<outData[0].length; i++) {
			outData[0][i] = y[i]/40;
			outData[1][i] = y[i]/40;
		}
	}

	getAudio();

	source.connect(demod).connect(filter).connect(ctx.destination);
	source.start();

	source.onended = function() {
		source.disconnect();
		demod.disconnect();
		filter.disconnect();
	}

}

function playPause(onoff) {
	if(!ctx) {
		initAudio();
	}
}

function updateVolume(vol) {
}

function updateDemod(method) {
}

function updateFilter(fltCond) {
}
