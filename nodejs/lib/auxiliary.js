'use strict'

/****************
export está no fim
*****************/

const { Transform } = require('stream');
const am = require('./demodulators/amiqdemod.js');
const fm = require('./demodulators/fmiqdemod.js');
const lsb = require('./demodulators/lsbiqdemod.js');
const usb = require('./demodulators/usbiqdemod.js');
const no = require('./demodulators/noiqdemod.js');

//filtro passa-baixa para 16kHz e fs de 300kHz
const audio_filter = [0.0094678, 0.0242009, 0.0661356, 0.1248971, 0.1766591, 0.1972793, 0.1766591, 0.1248971, 0.0661356, 0.0242009, 0.0094678]; 

//filtro aplicado antes da demodulação passa-baixa de 300kHz (fc = 100kHz, calculado na tentativa e erro)
const pre_filter = [-0.00438886, 0.01169655, -0.00039012, -0.09407404, 0.25293324, 0.66844646, 0.25293324, -0.09407404, -0.00039012, 0.01169655, -0.00438886]

function fir_filter(sinal, fltr_coef) {
    let sinal_length = sinal.length;
    let filter_order = fltr_coef.length;
    let y = 0;

    for(let i = 0; i<filter_order; i++)
        y += sinal[filter_order-i]*fltr_coef[i];

    return y;
}
//versão que está na master
let decimateff = new Transform({
	transform(chunk, encoding, cb) {
		//faz a decimação de 300kHz para 48kHz
		//a função espera um sinal monofônico
		let dec_ratio = 6; //Math.floor(300/48);
		chunk = new Float32Array(chunk.buffer);
		let output = [];
		for(let i = 0; i < chunk.length; i++) if(i%dec_ratio===0) output.push(chunk[i]);
		output = new Float32Array(output);
		this.push(Buffer.from(output.buffer));
		cb();
	}
});

/* versão antiga
let decimateff = new Transform({
	transform(chunk, encoding, cb) {
		//faz a decimação de 300kHz para 48kHz
		//a função espera um sinal monofônico
		let dec_ratio = 5; //Math.floor(300/48);
		chunk = new Float32Array(chunk.buffer);
		let output = [];
		for(let i = 0; i < chunk.length; i++) if(i%dec_ratio===0) output.push(chunk[i]);
		output = new Float32Array(output);
		this.push(Buffer.from(output.buffer));
		cb();
	}
});
*/

function filterff(chunkF) {
	let tmp = [];
	let y = [];
	let filter_order = audio_filter.length;
	for(let i = 0; i < chunkF.length; i++) {
		tmp.push(chunkF[i]);
		if(i > filter_order) {
			y[i] = fir_filter(tmp, audio_filter);
			tmp.shift();
		} else {
			y[i] = tmp[i];
		}
	}

	return y
}

let filterstreamff = new Transform({
	transform(chunk, encoding, cb) {

		chunk = new Float32Array(chunk.buffer);
		//console.log(chunk);
		let tmp = [];
		let y = [];
		let filter_order = audio_filter.length;

		for(let i = 0; i < chunk.length; i++) {
			tmp.push(chunk[i]);
			if(i > filter_order) {
				y[i] = fir_filter(tmp, audio_filter);
				tmp.shift();
			} else {
				y[i] = tmp[i];
			}
		}

		y = new Float32Array(y);
		//console.log(y);
	        this.push(Buffer.from(y.buffer));
		cb();
	}
});

let prefilterstreamff = new Transform({
	transform(chunk, encoding, cb) {

		chunk = new Float32Array(chunk.buffer);
		let iq = [[], []];
		for(let i = 0; i < chunk.length; i++) iq[Number(i%2!==0)].push(chunk[i]);
		//console.log(iq[0].length);
		//console.log(iq[1].length);
		//console.log(chunk.length);

		let tmp = [[], []];
		let y = [];
		let filter_order = audio_filter.length;

		for(let i = 0; i < chunk.length; i++) {
			let channel = Number(i%2!==0);

			tmp[channel].push(iq[channel][(i-channel)/2]);
			if(tmp[channel].length>filter_order) {
				y[i] = fir_filter(tmp[channel], pre_filter);
				tmp[channel].shift();
			} else if(i <= 1){
				y[i] = tmp[channel][(i-channel)/2];
			} else {
				y[i] = fir_filter(tmp[channel], pre_filter.slice(0, (i-channel)/2));
			}
		}

		y = new Float32Array(y);
		//console.log(y);
	        this.push(Buffer.from(y.buffer));
		cb();
	}
});

let bin2float = new Transform({
	transform(chunk, encoding, cb) {
		chunk = new Uint8Array(chunk);
		let y = [];
		for(let i = 0; i < chunk.length; i++) y.push(chunk[i]/127.5-1);
		//console.log(y);
		y = new Float32Array(y);
		this.push(Buffer.from(y.buffer));
		cb();
	}
});

let float2bin = new Transform({
	transform(chunk, encoding, cb) {
		let input = new Float32Array(chunk.buffer);
		let y = [];

		let min = input[0];
		input.forEach((sample) => { min = (min <= sample)?min:sample });
		input = input.map((sample) => { return sample-min });

		let max = input[0];
		input.forEach((sample) => { max = (max >= sample)?max:sample });
		y = input.map((sample) => { return Math.round(255*sample/max) });

		//console.log(y);
		y = new Uint8Array(y);
		//console.log(y);
	        this.push(Buffer.from(y));
		cb();
	}
})

module.exports = {
	fir_filter: fir_filter,
	audio_filter: audio_filter,
	decimateff: decimateff,
	filterstreamff: filterstreamff,
	prefilterstreamff: prefilterstreamff,
	bin2float: bin2float,
	float2bin: float2bin,
	filterff
}; 
