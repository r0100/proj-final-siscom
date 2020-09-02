'use strict'
const fs = require('fs');
const wav = require('wav');
const Stream = require('stream');
const aux = require('./auxiliary.js');
const fm = require('./demodulators/fmiqdemod.js');
const no = require('./demodulators/noiqdemod.js');

const FILE = '../raw_dec.dat';
const OUT_FILE = './dmd_dec.wav';

//let stream = fs.createReadStream(FILE);
let file_buf = fs.readFileSync(FILE);
let buf_flt = [];
let RTL_FS = 2.5e6;
let DMD_FS = 300e3;
let OUT_FS = 48e3;
const DC_RTO_PREDMD = Math.floor(2*RTL_FS/DMD_FS);
const DC_RTO_OUT = Math.floor(DMD_FS/OUT_FS);

//console.log(file_buf.length);
/*
for(let i = 0; i<file_buf.length; i+=2) {
	if(i%DC_RTO_PREDMD===0) {
		buf_flt.push(Number(file_buf[i])/127.5 - 1);
		buf_flt.push(Number(file_buf[i+1]/127.5 - 1));
	}
}
*/

for(let i = 0; i<file_buf.length; i++) buf_flt.push(Number(file_buf[i])/127.5 - 1);

//console.log(buf_flt);
//console.log(DC_RTO_PREDMD);

let iq = [[], []];
for(let i = 0; i<buf_flt.length; i++) iq[Number(i%2!==0)].push(buf_flt[i]);

for(let i = 0; i < 2; i++) iq[i] = no.iqdemod(iq[i], aux.pre_filter);
//console.log(iq.length);

let y = fm.iqdemod(iq, aux.audio_filter);

y = no.iqdemod(y, aux.audio_filter);

let ymax = 0;
let ymin = 0;
y.forEach((sample) => { ymin = (ymin<=sample)?ymin:sample });
y = y.map((sample) => { return sample - ymin})
y.forEach((sample) => { ymax = (ymax>=sample)?ymax:sample });
y = y.map((sample) => { return Math.round(sample*255/ymax) });
y = new Uint8Array(y);
let out_signal = [];

for(let i = 0; i < y.length; i++) if(i%DC_RTO_OUT===0) out_signal.push(y[i]);
out_signal = new Uint8Array(out_signal);

//console.log(y);

let out_stream = new Stream.Readable({
	read(size) {
		this.push(out_signal);
		this.push(null);
	}
});
//console.log(out_stream);

//let writer = wav.Writer({'channels': 1, 'sampleRate': OUT_FS, 'bitDepth': '32f'});
//let out_file = fs.createWriteStream(OUT_FILE);
let out_file = new wav.FileWriter(OUT_FILE, {
	sampleRate: OUT_FS,
	channels: 1,
	bitDepth: 8
});
out_stream.pipe(out_file);
