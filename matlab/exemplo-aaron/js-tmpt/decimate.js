'use strict'
const fs = require('fs');
const wav = require('wav');
const Stream = require('stream');
const aux = require('./auxiliary.js');
const fm = require('./demodulators/fmiqdemod.js');
const no = require('./demodulators/noiqdemod.js');

const FILE = '../raw.dat';
const OUT_FILE = '../raw_dec.dat';

let in_stream = fs.readFileSync(FILE);
console.log(in_stream.byteLength);

let buffer = new Uint8Array(in_stream);
console.log(buffer.length);
let out_buffer = [];

let dec_ratio = Math.floor(2*2.5e6/300e3);
console.log(dec_ratio);

for(let i = 0; i < buffer.length; i+=2) {
	if(i%dec_ratio===0) {
		out_buffer.push(buffer[i], buffer[i+1]);
	}
}

out_buffer = new Uint8Array(out_buffer);
console.log(out_buffer.length/3e6);
//console.log(buffer.length/dec_ratio);

fs.writeFileSync(OUT_FILE, Buffer.from(out_buffer));
