'use strict'

const  Write  = require('web-audio-stream/write')
const io = require('socket.io-client');

const GET_AUDIO = 'get-audio';
const RECV_AUDIO = 'received-audio'
const STOP_AUDIO = 'stop-audio';
const FS = 48e3;
const CHANNEL_NUM = 1;

let ctx;
let source;
let volume;
let audio_elmt;
let out_stream;

module.exports = {
	ctx: ctx,
	playPause: playPause,
	updateVolume: updateVolume,
//	updateDemod: updateDemod,
//	updateFilter: updateFilter
}

function initAudio(socket, cfg) {
	let audioContext = window.AudioContext||window.webkitAudioContext;
	ctx = new AudioContext({latencyHint: 'interactive', sampleRate: FS});
	audio_elmt = document.querySelector('#audio-stream');
	console.log(audio_elmt);
	audio_elmt.volume = 0.5;
	source = ctx.createMediaElementSource(audio_elmt);

	socket.emit(GET_AUDIO, cfg);
}

socket.on(RECV_AUDIO, (audio_data) => {
	//Filtra buffers de tamanho errado
	if (audio_data.byteLength % 2 !== 0) return;
	if(ctx===null) return;

	let bin_buffer = new Uint8Array(audio_data);
	console.log('bin_buffer');
	console.log(bin_buffer);
	let audio_buffer = [];
	audio_buffer = bin_buffer.map((sample) => {return (sample/127.5 -1)});
	audio_buffer = new Float32Array(audio_buffer);
	console.log('audio_buffer');
	console.log(audio_buffer);

	let myArrayBuffer = ctx.createBuffer(CHANNEL_NUM, audio_buffer.length, FS);
	//over-engineering is fun
	for(let i = 0; i<CHANNEL_NUM; i++) myArrayBuffer.copyToChannel(audio_buffer, i);
	//out_stream(myArrayBuffer);

	source.buffer = myArrayBuffer;
	source.connect(ctx.destination);
	audio_elmt.play();
});

socket.on('error', (reason) => {
	playPause('off', cfg, socket);
	console.log('Erro genérico')
	console.log(reason);
})

socket.on('connect_error', (reason) => {
	playPause('off', cfg, socket);
	console.log('Erro na conexão');
	console.log(reason);
})

socket.on('disconnect', (reason) => {
	playPause('off', cfg, socket);
	console.log('Erro, serviço disconectado');
	console.log(reason);
})


function playPause(onoff, cfg, socket) {
	//console.log(cfg);
	if(onoff==='on') {
		updateVolume(cfg.vol);
		initAudio(socket, cfg);
	} else {
		socket.emit(STOP_AUDIO);
		audio_elmt.pause();
		if(source && ctx) {
			source.disconnect()
			ctx.destination.disconnect();
			ctx = null;
			source=null;
		}
	}
}

function updateVolume(vol) {
	console.log('Novo valor de volume: ' + vol);
	if(volume)
		audio_elmt.volume = Number(vol)/100;
}
/*
function updateDemod(method) {
	console.log('Mudando para demodulação ' + method);
	demodMethod = method;
}
*/
/*
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
*/
