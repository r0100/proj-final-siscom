'use strict'

const fs = require("fs");
const express = require('express');
const path = require('path')
const { fork } = require('child_process');
const rtlsdr = require('rtl-sdr');

//const HOSTNAME = '127.0.0.1';
const PORT = process.env.PORT||5000;
//const URL_ADDR = 'proj-final-siscom.herokuapp.com';
const URL_ADDR = '127.0.0.1:'+PORT;
const AUDIO_FILE = './public/audios/audio.wav';

const app = express();

app.use(express.static('public'));

/*
setTimeout(() => {
	const deviceCount = rtlsdr.get_device_count();
	if (!deviceCount) {
		console.log("No supported RTLSDR devices found, server can't start");
		process.exit(1);
}
}, 0);
*/

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.get('/audio', async (req, res) => {
	res.writeHead(200, {
		'Content-Type': 'audio/wav',
	});

	let stream = fs.createReadStream(AUDIO_FILE);
	stream.pipe(res);
	/*
	const forked = fork('./lib/stream/continuous-stream.js');
	console.log('audio')
	forked.on('message', msg => {
		//console.log(msg);
		res.write(Buffer.from(msg.data));
	});
	*/
});

app.get('/test', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/html/test.html'));
});

app.get('/update-frq*', (req, res) => {
	let new_band = {};
	req.url.split('?')[1].split('&').forEach((eqtn) => {
		let cfg = eqtn.split('=');
		new_band[cfg[0]] = Number(cfg[1]);
	});
	console.log(new_band);
});

app.listen(PORT, () => {
	console.log('Server working at port ' + PORT);
	console.log('Check it at the address ' + URL_ADDR);
});
