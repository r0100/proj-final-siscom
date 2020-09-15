'use strict'

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path')
const fs = require('fs');

const aux = require('./lib/auxiliary.js');
const dem = require('./lib/demodulators/demodulator.js');
const sdr = require('./lib/stream/main-stream');

const PORT = process.env.PORT||5000;
const URL_ADDR = '127.0.0.1:'+PORT;
const AUDIO_FILE = path.join(__dirname, '/public/audios/raw.dat');
const SEND_AUDIO = 'received-audio'

const UPDATE_CFG = 'update-cfg';

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
		//stop();
	})
	socket.on(UPDATE_CFG, (usr_cfg) => {
		console.log('Atualizando configuração');
		console.log(usr_cfg);
		//let center_frq = Number(usr_cfg.frq) + (Number(usr_cfg.bnddr) - Number(usr_cfg.bndeq))/2;
		//sdr.set_center_freq(center_frq);
		//dem.demodulateff.changeDemodulator(usr_cfg.dmd);

		const { dmd } = usr_cfg;

		const flt = (usr_cfg.flt==='on')?true:false;

		//Convert string to number
		const frq =  Number(usr_cfg.frq)*1e6;

		if (frq) {
			if (frq >= sdr.MIN_CENTER_FREQ &&
				frq <= sdr.MAX_CENTER_FREQ) {
					//console.log(frq);
					sdr.mySdr.setCenterFreq(frq);
			}
		}
	
		if (dmd) {
			dem.demodulateff.changeDemodulator(dmd);
		}

		if (flt !== undefined) {
			dem.demodulateff.changeFilter(flt);
		}

	})
	/*
	socket.on('set_config', (config) => {
		console.log(config)
		const {center_freq, demodulation} = config;
		if (center_freq) {
			if (typeof center_freq === 'number') {
				if (center_freq >= sdr.MIN_CENTER_FREQ &&
					center_freq <= sdr.MAX_CENTER_FREQ) {
						sdr.mySdr.setCenterFreq(center_freq)
				}
			}
		}
	
		if (demodulation) {
			sdr.demodulateStream.changeDemodulator(demodulation)
		}
	})
	*/
})

//#############
//#####SDR#####
//#############

sdr.outStream
.pipe(dem.demodulateff)
.pipe(aux.decimateff).on('data', (chunk) => {
	//console.log('Enviando audio');
	console.log(chunk.length);
	io.emit(SEND_AUDIO, chunk);
})


sdr.mySdr.start();


http.listen(PORT, () => {
	console.log('Server working at port ' + PORT);
	console.log('Check it at the address ' + URL_ADDR);
})
