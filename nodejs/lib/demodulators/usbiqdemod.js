'use strict'

const aux = require("../auxiliary");
const { Transform } = require('stream');

/****************
export está no fim
*****************/


function demod(iq, fltr_coef) {
	let buffer_size = iq[0].length;
	let filter_order = fltr_coef.length;
	let y = [];
	let tmp = [];
	for(let count = 0; count<buffer_size; count++) {
		tmp.push(iq[0][count]+iq[1][count]);
		if(count>filter_order) {
			y[count] = aux.fir_filter(tmp, fltr_coef);
			tmp.shift();
		} else {
			y[count] = tmp[count];
		}
	}
	return y;
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
    iqdemod: demod, //soluçaõ temporaria para não quebrar código
    demod: demod,
    demodstreamff: demodstreamff //para uso com streams.
};
