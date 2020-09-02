'use strict'

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path')
const fs = require('fs');

//const sdr = require('./lib/stream/main-stream.js');

const PORT = process.env.PORT||5000;
const URL_ADDR = '127.0.0.1:'+PORT;
const AUDIO_FILE = path.join(__dirname, '/public/audios/raw.dat');
const GET_AUDIO = 'get-audio';
const RECV_AUDIO = 'received-audio'
const STOP_AUDIO = 'stop-audio';


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
	})
	socket.on(GET_AUDIO, (usr_cfg) => {
		console.log('Usuário ' + socket.id + ' requisitou audio');
		console.log(usr_cfg);
	})
	socket.on(STOP_AUDIO, () => {
		console.log('Usuário ' + socket.id + ' parou audio');
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
