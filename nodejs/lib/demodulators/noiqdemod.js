'use strict'

const aux = require("../auxiliary.js");
const { Transform } = require('stream');

/****************
export está no fim
*****************/

function demod(iq, fltr_coef) {
    let buffer_size = (iq[0].length)?(iq[0].length):iq.length;
    let filter_order = fltr_coef.length;
    let y = [];
    let tmp = [];

    for(let count = 0; count<buffer_size; count++) {
        tmp.push((iq[0].length)?iq[0][count]:iq[count]);

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
		for(let i = 0; i < chunk.length; i++) iq[Number(i%2!==0)].push(chunk[i]/127.5-1);
		let y = demod(iq, aux.audio_filter);
		y = new Float32Array(y);
		//console.log(y);
	        this.push(Buffer.from(y));
		cb();
	}
});


module.exports = {
    iqdemod: demod,
    demod: demod,
    demodstreamff: demodstreamff
};

//está acontecendo um bug com aux.fir_filter
//TODO: resolver esse maldito bug
function fir_filter(sinal, fltr_coef) {
    let sinal_length = sinal.length;
    let filter_order = fltr_coef.length;
    let y = 0;

    for(let i = 0; i<filter_order; i++)
        y += sinal[filter_order-i]*fltr_coef[i];

    return y;
}
