'use strict'

const http = require("http");
const fs = require("fs");
const express = require('express');
const getStat = require('util').promisify(fs.stat);
const path = require('path')

const aux = require("./lib/server-auxiliary");

//const HOSTNAME = '127.0.0.1';
//const URL_ADDR = 'proj-final-siscom.herokuapp.com';
const PORT = process.env.PORT||5000;
const URL_ADDR = '127.0.0.1:'+PORT;
const AUDIO_FILE = './public/audios/audio.wav';
const AUX_LIB = './lib/auxiliary.js'
const AM_LIB = './lib/demodulators/amiqdemod.js';
const FM_LIB = './lib/demodulators/fmiqdemod.js'
const LSB_LIB = './lib/demodulators/lsbiqdemod.js'
const USB_LIB = './lib/demodulators/usbiqdemod.js'

const {fork} = require('child_process');


const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public/html/index.html'));
})

app.get('/audio', async (req, res) => {
	//const stat = await getStat(AUDIO_FILE);
	res.writeHead(209, {
		'Content-Type': 'audio/wav',
		//Since it is a stream, there is no information about length
		//'Content-Length': stat.size
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
})

//Estes endpoints não serão mais necessários
//Pois para o js de cada pagina será montado usando require
//e construido com o browserify

/* app.get('/auxiliary.js', (req, res) => {
	res.writeHead(200, {
		'Content-Type': 'text/javascript'
	});
	res.write(fs.readFileSync(AUX_LIB));
	res.end();
});

app.get('/amiqdemod.js', (req, res) => {
	res.writeHead(200, {
		'Content-Type': 'text/javascript'
	});
	res.write(fs.readFileSync(AM_LIB));
	res.end();
});
 */

app.listen(PORT, () => {
	console.log('Server working at port ' + PORT);
	console.log('Check it at the address ' + URL_ADDR);
})
