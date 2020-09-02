'use strict'

const  Write  = require('web-audio-stream/write')
const io = require('socket.io-client');

const GET_AUDIO = 'get-audio';
const RECV_AUDIO = 'received-audio'
const STOP_AUDIO = 'stop-audio';
const AUDIO_EOF = 'audio-ended';
const FS = 48e3;
const CHANNEL_NUM = 1;

let ctx;
let source;
let volume;

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
	source = ctx.createBufferSource();
	volume = ctx.createGain();
	source.loop = true;
	source.playbackRate.value = 0.99;
	volume.gain.setValueAtTime(0.5, ctx.currentTime);
	source.connect(volume).connect(ctx.destination);
	source.start();

	console.log('pedindo audio');
	socket.emit(GET_AUDIO, cfg);

	socket.on(RECV_AUDIO, (audio_data) => {
		//console.log('dados recebidos');

		let shift_audio = false;
		//Filtra buffers de tamanho errado
		if (audio_data.byteLength % 2 !== 0) shift_audio = true;

		if(ctx===null) {
			console.log('Erro: ctx (AudioContext) nulo');
			return;
		}

		let audio_buffer = new Float32Array(audio_data);
		if(shift_audio) audio_buffer.shift();
		//console.log(audio_buffer);

		let myArrayBuffer = ctx.createBuffer(CHANNEL_NUM, audio_buffer.length, FS);
		//over-engineering is fun
		for(let i = 0; i<CHANNEL_NUM; i++) myArrayBuffer.copyToChannel(audio_buffer, i);
		//out_stream(myArrayBuffer);

			source.buffer = myArrayBuffer;
			console.log(source.buffer);
	});

	socket.on(AUDIO_EOF, () => {
		playPause('off', cfg, socket);
		console.log('Fim do audio');
	})
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
}

function playPause(onoff, cfg, socket) {
	if(onoff==='on') {
		console.log('Ligando o audio')
		updateVolume(cfg.vol);
		initAudio(socket, cfg);
	} else {
		console.log('Desligando o audio');
		socket.emit(STOP_AUDIO);
		if(volume) {
			volume.gain.setValueAtTime(0, ctx.currentTime);
			volume.disconnect();
		}
		if(source) {
			source.loop = false;
			source.stop();
			source.disconnect();
		}
		if(ctx) ctx.destination.disconnect();
		ctx = null;
		volume = null;
		source=null;
	}
}

function updateVolume(vol) {
	console.log(vol);
	console.log('Novo valor de volume: ' + vol);
	if(volume)
		volume.gain.setValueAtTime(Number(vol)/100, ctx.currentTime);
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
