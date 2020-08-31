const am = require('../../demodulators/amiqdemod.js');
const fm = require('../../demodulators/fmiqdemod.js');
const lsb = require('../../demodulators/lsbiqdemod.js');
const usb = require('../../demodulators/usbiqdemod.js');
const no = require('../../demodulators/noiqdemod.js');
const aux = require('../../auxiliary.js');

'use strict'

const AUDIO = '/audio';
const LPF = 5000;
const NO_FILTER = 22050;
//const LPF = aux.audio_filter;
//const NO_FILTER = [1, 0, 0];
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
	let audioContext = window.AudioContext||window.webkitAudioContext;
	ctx = new AudioContext({latencyHint: 'interactive', sampleRate: FS});
	source = ctx.createBufferSource();
	demod = ctx.createScriptProcessor(BUFFER_SIZE, 2, 2);
	volume = ctx.createGain();
	//filter = LPF;
	filter = ctx.createBiquadFilter();
	filter.type = 'lowpass';
	filter.frequency.value = LPF;
	volume.gain.setValueAtTime(0.5, ctx.currentTime);

	function getAudio() {
		request = new XMLHttpRequest();
		request.open('GET', AUDIO+'?frq='+frq+'&bndeq='+bndeq+'&bnddr='+bnddr, true);
		request.responseType = 'arraybuffer';
		request.onload = function() {
			let audioData = request.response;
			console.log(audioData);
			if(audioData) {
				let fBuff = new Float32Array(audioData)
				console.log(fBuff);
				myArrayBuffer = ctx.createBuffer(2, (fBuff.length-1)/2, FS);
				let nowBuffering = [myArrayBuffer.getChannelData(0), myArrayBuffer.getChannelData(1)];
				for (let i = 0; i < (fBuff.length-1)/2; i++) {
					nowBuffering[0][i] = (isNaN(fBuff[2*i]))?0:fBuff[2*i];
					nowBuffering[1][i] = (isNaN(fBuff[2*i+1]))?0:fBuff[2*i+1];
				}
				source.buffer = myArrayBuffer;
			}
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

	source.loop = true;
	source.connect(demod).connect(filter).connect(volume).connect(ctx.destination);
	source.start();
	getAudio();
}

function playPause(onoff, vol) {
	if(onoff==='on') {
		updateVolume(vol);
		if(!ctx) initAudio();
	} else {
		volume.gain.setValueAtTime(0, ctx.currentTime);
		source.disconnect()
		demod.disconnect()
		volume.disconnect()
		ctx.destination.disconnect();
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
		filter.frequency.value = LPF
	} else {
		filter.frequency.value = NO_FILTER;
	}
	console.log(filter);
}

function updateFrq(newFrq, newBndeq, newBnddr) {
	console.log('Banda de ' + newFrq + ' + ' + newBnddr + ' e - ' + newBndeq);
	frq = Number(newFrq);
	bndeq = Number(newBndeq);
	bnddr = Number(newBnddr);
}
