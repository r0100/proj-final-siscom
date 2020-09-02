'use strict'

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path')
const fs = require('fs');

const sdr = require('./lib/stream/main-stream.js');
const { mySdr } = require('./lib/stream/main-stream.js');

//const HOSTNAME = '127.0.0.1';
const PORT = process.env.PORT||5000;
//const URL_ADDR = 'proj-final-siscom.herokuapp.com';
const URL_ADDR = '127.0.0.1:'+PORT;
const AUDIO_FILE = path.join(__dirname, '/public/audios/test');


app.use(express.static('public'));


app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.get('/audio', async (req, res) => {
	
	res.sendFile(AUDIO_FILE);
});

app.get('/test', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/html/test.html'));
});

//############
//###SOCKET###
//############
io.on('connection', (socket) => {
	console.log('user connected');

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

	socket.on('disconnect', () => {
		console.log('User disconnected');
	})
})

//#############
//#####SDR#####
//#############
sdr.outStream.on('data', (chunk) => {
	console.log(chunk.length)
	io.emit('raw_audio', chunk);
})
sdr.mySdr.start();

app.get('/update-frq*', (req, res) => {
	let new_band = {};
	req.url.split('?')[1].split('&').forEach((eqtn) => {
		let cfg = eqtn.split('=');
		new_band[cfg[0]] = Number(cfg[1]);
	});
	console.log(new_band);
});

http.listen(PORT, () => {
	console.log('Server working at port ' + PORT);
	console.log('Check it at the address ' + URL_ADDR);
});
