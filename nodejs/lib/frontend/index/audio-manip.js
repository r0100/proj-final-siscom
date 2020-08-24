const am = require('../../demodulators/amiqdemod.js');
const fm = require('../../demodulators/fmiqdemod.js');
const lsb = require('../../demodulators/lsbiqdemod.js');
const usb = require('../../demodulators/usbiqdemod.js');
const no = require('../../demodulators/noiqdemod.js');
const aux = require('../../auxiliary.js');

'use strict'

const AUDIO = '/audio';
//const LPF = 16000;
//const NO_FILTER = 22050;
const LPF = aux.audio_filter;
const NO_FILTER = [1, 0, 0];
const BUFFER_SIZE = 4096;

let ctx;
let source;
let demod;
let filter;
let volume;
let demodMethod = 'nenhum';


module.exports = {
	ctx: ctx,
	playPause: playPause,
	updateVolume: updateVolume,
	updateDemod: updateDemod,
	updateFilter: updateFilter
}

function initAudio() {
	let audioContext = window.AudioContext||window.webkitAudioContext;
	ctx = new AudioContext();
	source = ctx.createBufferSource();
	demod = ctx.createScriptProcessor(BUFFER_SIZE, 2, 2);
	//filter = ctx.createBiquadFilter();
	volume = ctx.createGain();
	/*
	filter.type = 'lowpass';
	filter.gain.value = 1;
	filter.frequency.value = LPF;
	*/
	filter = LPF;
	volume.gain.setValueAtTime(0.5, ctx.currentTime);

	function getAudio() {
		request = new XMLHttpRequest();
		request.open('GET', AUDIO, true);
		request.responseType = 'arraybuffer';
		request.onload = function() {
			let audioData = request.response;
			ctx.decodeAudioData(audioData, function(buffer) {
				myBuffer = buffer;
				source.buffer = myBuffer;
			},
			function(e){"Error with decoding audio data" + e.err});
		}
		request.send();
	}

	demod.onaudioprocess = function(audioProcessingEvent) {
		let inputBuffer = audioProcessingEvent.inputBuffer;
		let outputBuffer = audioProcessingEvent.outputBuffer;

		let iq = [inputBuffer.getChannelData(0), inputBuffer.getChannelData(1)];

		switch(demodMethod) {
			case 'am':
				console.log('am');
				y = am.iqdemod(iq, filter);
				break;
			case 'fm':
				console.log('fm');
				y = fm.iqdemod(iq, filter);
				break;
			case 'lsb':
				console.log('lsb');
				y = lsb.iqdemod(iq, filter);
				break;
			case 'usb':
				console.log('usb');
				y = usb.iqdemod(iq, filter);
				break;
			default:
				y = no.iqdemod(iq, filter);
		}
		//console.log('Vetor de saída: ');
		//console.log(y);
		let outData = [outputBuffer.getChannelData(0), outputBuffer.getChannelData(1)];
		for(let i = 0; i<outData[0].length; i++) {
			outData[0][i] = y[i];
			outData[1][i] = y[i];
		}
	}

	getAudio();

	source.loop = true;
	//source.connect(demod).connect(filter).connect(volume).connect(ctx.destination);
	source.connect(demod).connect(volume).connect(ctx.destination);
	source.start();
	/*
	source.onended = function() {
		source.disconnect();
		demod.disconnect();
		filter.disconnect();
		volume.disconnect();
		initAudio();
	}
	*/

}

function playPause(onoff, vol) {
	if(!ctx) {
		initAudio();
	}
	if(onoff==='on') {
		updateVolume(vol);
	} else {
		volume.gain.setValueAtTime(0, ctx.currentTime);
		ctx = null;
		volume = null;
		source=null;
		filter=null;
	}
}

function updateVolume(vol) {
	console.log('Novo valor de volume: ' + vol);
	if(volume)
		volume.gain.setValueAtTime(Number(vol)/100, ctx.currentTime);
}

function updateDemod(method) {
	console.log('Mudando para demodulação ' + method);
	demodMethod = method;
}

function updateFilter(fltCond) {
	console.log('Filtro em ' + fltCond);
	if(!filter)
		return;

	if(fltCond==='on') {
		//filter.frequency.value = LPF;
		filter = LPF
	}
	else {
		//filter.frequency.value = NO_FILTER;
		filter = NO_FILTER;
	}
	console.log(filter);
}
