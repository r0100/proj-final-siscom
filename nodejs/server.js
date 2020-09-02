'use strict'

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path')
const fs = require('fs');

//const sdr = require('./lib/stream/main-stream.js');
const aux = require('./lib/auxiliary.js');
const am = require('./lib/demodulators/amiqdemod.js');
const fm = require('./lib/demodulators/fmiqdemod.js');
const lsb = require('./lib/demodulators/lsbiqdemod.js');
const usb = require('./lib/demodulators/usbiqdemod.js');
const no = require('./lib/demodulators/noiqdemod.js');

const PORT = process.env.PORT||5000;
const URL_ADDR = '127.0.0.1:'+PORT;
const AUDIO_FILE = path.join(__dirname, '/public/audios/raw.dat');
const GET_AUDIO = 'get-audio';
const RECV_AUDIO = 'received-audio'
const STOP_AUDIO = 'stop-audio';

let in_stream = fs.createReadStream(AUDIO_FILE)
let demod;

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
		console.log('Usuário ' + socket.id + ' requisitou audio');
		console.log(usr_cfg);

		let center_frq = Number(usr_cfg.frq) + (Number(usr_cfg.bnddr) - Number(usr_cfg.bndeq))/2;
		//sdr.set_center_freq(center_frq);
		switch(usr_cfg.dmd) {
			case 'am': demod = am.demodstreamff; break;
			case 'fm': demod = fm.demodstreamff; break;
			case 'lsb': demod = lsb.demodstreamff; break;
			case 'usb': demod = usb.demodstreamff; break;
			default: demod = no.demodstreamff; break;
		}
		//deve ter uma maneira melhor de fazer isso
		console.log('Aplicando pipes');
		if(usr_cfg.flt==='on') {
			in_stream.pipe(aux.bin2float)
				.pipe(aux.prefilterstreamff)
				.pipe(demod)
				.pipe(aux.filterstreamff)
				.pipe(aux.decimateff)
				.pipe(aux.float2bin)
		} else {
			in_stream.pipe(aux.bin2float)
				.pipe(aux.prefilterstreamff)
				.pipe(demod)
				.pipe(aux.decimateff)
				.pipe(aux.float2bin)
		}
		console.log('enviando dados');

		aux.float2bin.on('data', (chunk) => {
			//console.log('Enviando audio');
			console.log(chunk);
			io.emit(RECV_AUDIO, chunk);
		})

	})
	socket.on(STOP_AUDIO, () => {
		console.log('Usuário ' + socket.id + ' parou audio');
		stop();
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
	in_stream.pause();
	aux.bin2float.pause();
	aux.prefilterstreamff.pause();
	if(demod) demod.pause();
	demod = null;
	aux.filterstreamff.pause();
	aux.float2bin.pause();
}
