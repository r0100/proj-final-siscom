'use strict'

const aux = require("../auxiliary");
const { Transform } = require('stream');

/****************
export está no fim
*****************/

function demod(iq)
{
	let buffer_size = iq[0].length;
	let tmp = [];
	for(let count = 0; count<buffer_size; count++) { 
		let i = iq[0][count];
		let q = iq[1][count];
		tmp.push(Math.sqrt(i*i + q*q)); //tira a magnitude da amostra IQ
	/* 	//filtro
		if(count>filter_order) {
			y[count] = aux.fir_filter(tmp, fltr_coef);
			tmp.shift();
		} else {
			y[count] = tmp[count];
		}
		//min = (min<y[count])?min:y[count]; //toma o menor valor do sinal 
		offset += y[count]/buffer_size; */
	}
/* 	for(let count = 0; count<buffer_size; count++)
		y[count]-=offset; //retira o offset do sinal */
	return tmp;
}

let demodstreamff = new Transform({
	transform(chunk, encoding, cb) {
		//streamdemod espera um chunk como um buffer com os valores iq justapostos em sequência (i, q, i, q,...)
		//os valores são um array de 8bits cada valor
		chunk = new Float32Array(chunk.buffer);
		//console.log(chunk);
		let iq = [[], []];
		for(let i = 0; i < chunk.length; i++) {
			let channel = Number(i%2!==0);
			iq[channel].push(chunk[i]);
		}
		let y = demod(iq, aux.audio_filter);
		y = new Float32Array(y);
		//console.log(y);
	        this.push(Buffer.from(y.buffer));
		cb();
	}
});

module.exports = {
	iqdemod: demod,
	demod: demod,
	demodstreamff, demodstreamff
}
