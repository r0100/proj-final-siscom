'use strict'

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path')

const aux = require('./lib/auxiliary.js');
const dem = require('./lib/demodulators/demodulator.js');
const sdr = require('./lib/stream/main-stream');

const PORT = process.env.PORT||5000;
const URL_ADDR = '127.0.0.1:'+PORT;
const SEND_AUDIO = 'received-audio'

const UPDATE_CFG = 'update-cfg';

app.use(express.static('public'));

let bytesSent = 0;

//##################
//#####WEB-PAGE#####
//##################
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

//############
//###SOCKET###
//############
io.on('connection', (socket) => {
	console.log('Usuário ' + socket.id + ' conectou');
	socket.on('disconnect', () => {
		console.log('Usuário ' + socket.id + ' desconectou');
		//stop();
	})
	socket.on(UPDATE_CFG, (usr_cfg) => {
		console.log('Atualizando configuração');
		console.log(usr_cfg);
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
})

//#############
//#####SDR#####
//#############
sdr.outStream
.pipe(dem.demodulateff)
.pipe(aux.decimateff).on('data', (chunk) => {
	//console.log('Enviando audio');
	//console.log(`Pacote de ${chunk.length/(1024)} kB enviado.`);
	bytesSent += chunk.length;
	io.emit(SEND_AUDIO, chunk);
})
sdr.mySdr.start();

setInterval(() => {
	console.log(`Upload Speed: ${bytesSent/1024} kbps`)
	bytesSent = 0;
}, 1000 )


http.listen(PORT, () => {
	console.log('Server working at port ' + PORT);
	console.log('Check it at the address ' + URL_ADDR);
})
