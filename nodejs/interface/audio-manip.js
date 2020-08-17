'use strict'

let audio;
const LPF = 1000;
const NO_FILTER = 25000;
const CHANNELS = 2;
let SAMPLE_RATE;
let BUFFER_SIZE = 4096;

function initAudio() {
	let AudioContext = window.AudioContext || window.webkitAudioContext;
	let element = document.getElementById('audio-stream');
	let context = new AudioContext();
	SAMPLE_RATE = context.sampleRate;
	let source = context.createMediaElementSource(element);
	//let source = context.createBufferSource();
	let filter = context.createBiquadFilter();
	let demod = context.createScriptProcessor(BUFFER_SIZE, 1, 1);

	source.connect(filter).connect(context.destination);

	element.volume = 0.5;
	filter.type = 'lowpass';
	filter.frequency.value = LPF;
	filter.gain.value = 1;

	audio = {element: element, context: context, demod: demod, source: source, filter: filter};
}

function audioPlayPause(onoff) {
	if(onoff==='on') {
		audio.element.play();
	}
	else {
		audio.element.pause();
		audio.element.currentTime = 0;
	}

}

function updateVolume(vol) {
	audio.element.volume = Number(vol)/100;
}

function updateDemod(method) {
}

function getAudio() {
	let audioBuffer = 0;
	return audioBuffer;
}

function updateFilter(fltCond) {
	if(fltCond==='on') {
		audio.filter.frequency.value = LPF;
	}
	else {
		audio.filter.frequency.value = NO_FILTER;
	}
}
