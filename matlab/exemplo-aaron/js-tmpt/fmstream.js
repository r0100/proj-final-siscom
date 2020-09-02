'use strict'
const fs = require('fs');
const wav = require('wav');
const Stream = require('stream');
const aux = require('./auxiliary.js');
const fm = require('./demodulators/fmiqdemod.js');
const no = require('./demodulators/noiqdemod.js');

const FILE = '../raw_dec.dat';
const OUT_FILE = './dmdstream.wav';

let IN_FS = 300e3;
let OUT_FS = 48e3;

let writer = new wav.Writer({
	sampleRate: OUT_FS,
	channels: 1,
	bitDepth: 8
});

let inputStream = fs.createReadStream(FILE)
let outputStream = fs.createWriteStream(OUT_FILE);

inputStream.pipe(aux.bin2float)
	.pipe(aux.prefilterstreamff)
	.pipe(fm.demodstreamff)
	.pipe(aux.filterstreamff)
	.pipe(aux.decimateff)
	.pipe(aux.float2bin)
	.pipe(writer).pipe(outputStream);
