'use strict'

const  Write  = require('web-audio-stream/write')
const io = require('socket.io-client');

const GET_AUDIO = 'get-audio';
const RECV_AUDIO = 'received-audio'
const STOP_AUDIO = 'stop-audio';
const AUDIO_EOF = 'audio-ended';
const UPDATE_CFG = 'update-cfg';
const FS = 48e3;
const CHANNEL_NUM = 1;

let ctx = new AudioContext({latencyHint: 'interactive', sampleRate: FS});
let outAudioStream;
let socket; 


//let source;
let volume;

module.exports = {
	ctx: ctx,
	playPause: playPause,
	updateVolume: updateVolume,
	sendInfoServer: sendInfoServer
}

function initAudio(cfg) {
    socket = io();

	console.log('pedindo audio');
	//socket.emit(GET_AUDIO, cfg);

	socket.on(RECV_AUDIO, (audio_data) => {
		console.log(audio_data.length);

		//Is necessary create the audio stream only when using it
        // because it keeps raising incorrect input error
        if (!outAudioStream) {
            outAudioStream = Write(ctx.destination, {
                channels: 1
            });
        }

		 //Filter wrong buffers
		 if (data.byteLength % 2 !== 0)
		 	return;

		if(ctx===null) {
			console.log('Erro: ctx (AudioContext) nulo');
			return;
		}

		let audio_buffer = new Float32Array(audio_data);
		//console.log(audio_buffer);

		let myArrayBuffer = ctx.createBuffer(CHANNEL_NUM, audio_buffer.length, FS);
		//over-engineering is fun
		for(let i = 0; i<CHANNEL_NUM; i++) myArrayBuffer.copyToChannel(audio_buffer, i);
		//out_stream(myArrayBuffer);

		outAudioStream(myArrayBuffer)
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

function playPause(onoff, cfg) {
	if(onoff==='on') {
		console.log('Ligando o audio')
		//updateVolume(cfg.vol);
		initAudio(cfg);
	} else {
		console.log('Desligando o audio');
		//socket.emit(STOP_AUDIO);
		stop();
	}
}

function stop() {
    if (socket)
        socket.close();

    socket = null;

    if (outAudioStream)
        outAudioStream(null);

    outAudioStream = null;
}

function cleanAudioCache() {
    if (outAudioStream) {
        outAudioStream(null);
        outAudioStream = Write(audioCtx.destination, {
            channels: 1
        });
    }
}

function updateVolume(vol) {
	console.log(vol);
	console.log('Novo valor de volume: ' + vol);
	if(volume)
		volume.gain.setValueAtTime(Number(vol)/100, ctx.currentTime);
}

function sendInfoServer(cfg) {
	//socket.emit(STOP_AUDIO);
	socket.emit(UPDATE_CFG, cfg);
}