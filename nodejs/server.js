'use strict'

const fs = require("fs");
const express = require('express');
const getStat = require('util').promisify(fs.stat);
const path = require('path')

//const HOSTNAME = '127.0.0.1';
const PORT = process.env.PORT||5000;
//const URL_ADDR = 'proj-final-siscom.herokuapp.com';
const URL_ADDR = '127.0.0.1:'+PORT;
const AUDIO_FILE = './public/audios/audio.wav';

const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

app.get('/audio', async (req, res) => {
	//const stat = await getStat(AUDIO_FILE);
	res.writeHead(209, {
		'Content-Type': 'audio/wav',
	});

	//let stream = fs.createReadStream(AUDIO_FILE);
	///stream.on('end', () => console.log('Fim do arquivo'));
	//stream.pipe(res);

	const forked = fork('./lib/stream/continuous-stream.js');

	console.log('audio')
	forked.on('message', msg => {
		console.log(msg)
		res.write(Buffer(msg.data))
	})



});

app.get('/test', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/html/test.html'));
});

app.listen(PORT, () => {
	console.log('Server working at port ' + PORT);
	console.log('Check it at the address ' + URL_ADDR);
});
