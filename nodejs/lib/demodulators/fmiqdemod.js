'use strict'

const aux = require("../auxiliary");
const { Transform } = require('stream');

/****************
export está no fim
*****************/

function demod(iq, fltr_coef) {
	let buffer_size = iq[0].length;
	let y = [];
	let tmp = [];
	let filter_order = fltr_coef.length;
	const CORR_FACTOR = 0.340447550238101026565118445432744920253753662109375; //retirado do código do csdr
	for(let count = 0; count<buffer_size; count++) {
		let i = iq[0][count];
		let q = iq[1][count];
		let di = count===0?i:(iq[0][count]-iq[0][count-1]);
		let dq = count===0?q:(iq[1][count]-iq[1][count-1]);
		let den = i*i + q*q;
		tmp.push( (den===0)?0:CORR_FACTOR*(i*dq - q*di)/den );
		if(count>filter_order) {
			y[count] = fir_filter(tmp, fltr_coef);
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

function fir_filter(sinal, fltr_coef) {
    let sinal_length = sinal.length;
    let filter_order = fltr_coef.length;
    let y = 0;

    for(let i = 0; i<filter_order; i++)
        y += sinal[filter_order-i]*fltr_coef[i];

    return y;
}

