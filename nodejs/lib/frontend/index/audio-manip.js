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
const FS = 150000;

let ctx;
let source;
let demod;
let filter;
let volume;
let demodMethod = 'nenhum';
let frq = 97.5;
let bndeq = 16;
let bnddr = 16;

module.exports = {
	ctx: ctx,
	playPause: playPause,
	updateVolume: updateVolume,
	updateDemod: updateDemod,
	updateFilter: updateFilter,
	updateFrq: updateFrq
}

function initAudio() {
	let audioElement = document.getElementById('audio-stream');
	let audioContext = window.AudioContext||window.webkitAudioContext;
	ctx = new AudioContext({latencyHint: 'interactive', sampleRate: FS});
	//source = ctx.createBufferSource();
	source=  ctx.createMediaElementSource(audioElement);
	demod = ctx.createScriptProcessor(BUFFER_SIZE, 2, 2);
	volume = ctx.createGain();
	filter = LPF;
	volume.gain.setValueAtTime(0.5, ctx.currentTime);

	function getAudio() {
		request = new XMLHttpRequest();
		request.open('GET', AUDIO+'?frq='+frq+'&bndeq='+bndeq+'&bnddr='+bnddr, true);
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
		if(filter==null) filter = LPF;
		let inputBuffer = audioProcessingEvent.inputBuffer;
		let outputBuffer = audioProcessingEvent.outputBuffer;

		let iq = [inputBuffer.getChannelData(0), inputBuffer.getChannelData(1)];
		//console.log(iq);

		switch(demodMethod) {
			case 'am':
				//console.log('am');
				y = am.iqdemod(iq, filter);
				break;
			case 'fm':
				//console.log('fm');
				y = fm.iqdemod(iq, filter);
				break;
			case 'lsb':
				//console.log('lsb');
				y = lsb.iqdemod(iq, filter);
				break;
			case 'usb':
				//console.log('usb');
				y = usb.iqdemod(iq, filter);
				break;
			default:
				y = no.iqdemod(iq, filter);
				break;
		}
		//console.log('Vetor de saída: ');
		//console.log(y);
		let outData = [outputBuffer.getChannelData(0), outputBuffer.getChannelData(1)];
		for(let i = 0; i<outData[0].length; i++) {
			outData[0][i] = y[i];
			outData[1][i] = y[i];
		}
	}

	//getAudio();

	source.loop = true;
	source.connect(demod).connect(volume).connect(ctx.destination);
	audioElement.src = '/audio?frq=' + frq + '&bndeq=' + bndeq + '&bnddr=' + bnddr;
	console.log(audioElement.src);
	audioElement.play();
	//source.start();
}

function playPause(onoff, vol) {
	if(onoff==='on') {
		updateVolume(vol);
		if(!ctx) initAudio();
		document.getElementById('audio-stream').play();
	} else {
		volume.gain.setValueAtTime(0, ctx.currentTime);
		/*
		source.disconnect()
		demod.disconnect()
		volume.disconnect()
		ctx.destination.disconnect();
		ctx = null;
		volume = null;
		source=null;
		filter=null;
		*/
		document.getElementById('audio-stream').pause();
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
		filter = LPF
	} else {
		filter = NO_FILTER;
	}
	console.log(filter);
}

function updateFrq(newFrq, newBndeq, newBnddr) {
	console.log('Banda de ' + newFrq + ' + ' + newBnddr + ' e - ' + newBndeq);
	frq = Number(newFrq);
	bndeq = Number(newBndeq);
	bnddr = Number(newBnddr);
}
