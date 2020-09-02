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
	audio_elmt.volume = 0.5;
	source = ctx.createMediaElementSource(audio_elmt);

	socket.emit(GET_AUDIO, cfg);
	socket.on(RECV_AUDIO, (audio_data) =>{
		if(!out_stream) {
			out_stream = Write(ctx.destination, {
				channels: CHANNEL_NUM
			});
		}

		//Filtra buffers de tamanho errado
		if (audio_data.byteLength % 2 !== 0)
		    return;

		let audio_buffer = new Uint8Array(audio_data);
		myArrayBuffer = ctx.createBuffer(CHANNEL_NUM, audio_buffer, FS);
		//over-engineering is fun
		for(let i = 0; i<CHANNEL_NUM; i++) myArrayBuffer.copyToChannel(audio_buffer, i);
		//out_stream(myArrayBuffer);

		source.buffer = myArrayBuffer;
		source.connect(ctx.destination);
		audio_elmt.play();
	});

	socket.on('error', (reason) => {
		console.log('Erro genérico')
		console.log(reason);
		stop()
	})

	socket.on('connect_error', (reason) => {
		console.log('Erro na conexão');
		console.log(reason);
		stop()
	})

	socket.on('disconnect', (reason) => {
		console.log('Erro, serviço disconectado');
		console.log(reason);
		stop();
	})

}

function playPause(onoff, cfg, socket) {
	console.log(cfg);
	if(onoff==='on') {
		updateVolume(cfg.vol);
		initAudio(socket, cfg);
	} else {
		socket.emit(STOP_AUDIO);
		audio_elmt.pause();
		source.disconnect()
		ctx.destination.disconnect();
		ctx = null;
		source=null;
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
