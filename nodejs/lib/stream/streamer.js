'use strict'

const {Transform} = require('stream');
const StreamCache = require('stream-cache');
const { spawn } = require('child_process');
const wav  = require('wav');
const wavreader = new wav.Reader();

const RtlSdr = require('./sdr-rtl-stream');
const aux = require('../auxiliary.js');

const DEFAULT_FRQ = 97.5e6;
const DEFAULT_BNDEQ = 16e6;
const DEFAULT_BNDDR = 16e6;
const SAMPLE_RATE = 2.5e6;//240e3;
const DEC_RATIO = String(Math.round(SAMPLE_RATE/300e3));

module.exports = class Streamer {
	constructor() {
		//this.sdr = new RtlSdr(0);
		this.u8_to_f = spawn('csdr', ['convert_u8_f']);
		this.decimator = spawn('csdr', ['fractional_decimator_ff', DEC_RATIO]);
		this.dem = spawn('csdr', ['fmdemod_quadri_cf']);
		this.f_to_s16 = spawn('csdr', ['convert_f_s16']);
		this.f_to_s8 = spawn('csdr', ['convert_f_s8']);
	}
}
