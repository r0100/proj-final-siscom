'use strict'

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path')
const fs = require('fs');

//const sdr = require('./lib/stream/main-stream.js');
const aux = require('./lib/auxiliary.js');
const dem = require('./lib/demodulators/demodulator.js');

const PORT = process.env.PORT||5000;
const URL_ADDR = '127.0.0.1:'+PORT;
const AUDIO_FILE = path.join(__dirname, '/public/audios/raw.dat');
const GET_AUDIO = 'get-audio';
const RECV_AUDIO = 'received-audio'
const STOP_AUDIO = 'stop-audio';
const AUDIO_EOF = 'audio-ended';
const UPDATE_CFG = 'update-cfg';

let in_stream;

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.get('/test', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/html/test.html'));
});

//############
//###SOCKET###
//############
io.on('connection', (socket) => {
	console.log('Usuário ' + socket.id + ' conectou');


	socket.on('disconnect', () => {
		console.log('Usuário ' + socket.id + ' disconectou');
		stop();
	})
	socket.on(GET_AUDIO, (usr_cfg) => {
		//console.log('Usuário ' + socket.id + ' requisitou audio');
		console.log(usr_cfg);

		stop();
		reset();

		//let center_frq = Number(usr_cfg.frq) + (Number(usr_cfg.bnddr) - Number(usr_cfg.bndeq))/2;
		//sdr.set_center_freq(center_frq);

		dem.demodulateff.changeDemodulator(usr_cfg.dmd)

		fs.createReadStream(AUDIO_FILE).pipe(aux.bin2float).pipe(aux.prefilterstreamff).pipe(dem.demodulateff);
		
		if(usr_cfg.flt==='on')
			dem.demodulateff.pipe(aux.filterstreamff).pipe(aux.decimateff);
		else
			dem.demodulateff.pipe(aux.decimateff);
	})
	socket.on(STOP_AUDIO, () => {
		//console.log('Usuário ' + socket.id + ' parou o audio');
		stop();
		reset();
		in_stream = fs.createReadStream(AUDIO_FILE);
	})
	socket.on(UPDATE_CFG, (usr_cfg) => {
		console.log('Atualizando configuração');
		console.log(usr_cfg);
		//let center_frq = Number(usr_cfg.frq) + (Number(usr_cfg.bnddr) - Number(usr_cfg.bndeq))/2;
		//sdr.set_center_freq(center_frq);
		dem.demodulateff.changeDemodulator(usr_cfg.dmd);
	})
	aux.decimateff.on('data', (chunk) => {
		//console.log('Enviando audio');
		//console.log(chunk);
		io.emit(RECV_AUDIO, chunk);
	})
	aux.decimateff.on('end', () => {
		io.emit(AUDIO_EOF);
		stop();
		reset();
	})
})

//#############
//#####SDR#####
//#############
/*
sdr.outStream.on('data', (chunk) => {
	console.log(chunk.length)
	io.emit('raw_audio', chunk);
})
sdr.mySdr.start();
*/

http.listen(PORT, () => {
	console.log('Server working at port ' + PORT);
	console.log('Check it at the address ' + URL_ADDR);
});

function stop() {
	if(in_stream) {
		in_stream.pause();
		in_stream.unpipe();
		in_stream = null;
	}
	aux.bin2float.pause();
	aux.bin2float.unpipe();
	aux.prefilterstreamff.pause();
	aux.prefilterstreamff.unpipe();
	aux.filterstreamff.pause();
	aux.filterstreamff.unpipe();
	dem.demodulateff.pause();
	dem.demodulateff.unpipe();
	aux.float2bin.pause();
	aux.float2bin.unpipe();
}

function reset() {
	in_stream = fs.createReadStream(AUDIO_FILE);
}
