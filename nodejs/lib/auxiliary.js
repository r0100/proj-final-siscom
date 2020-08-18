'use strict'
//const fs = require('fs');

const audio_filter = [0.0261, 0.1402, 0.3337, 0.3337, 0.1402, 0.0261]; //filtro passa-baixa para 16000Hz

module.exports = {
	fir_filter: fir_filter,
	//wavreader: wavreader,
	audio_filter: audio_filter
}; 

function fir_filter(sinal, fltr_coef) {
    let sinal_length = sinal.length;
    let filter_order = fltr_coef.length;
    let y = 0;

    for(let i = 0; i<filter_order; i++)
        y += sinal[filter_order-i]*fltr_coef[i];

    return y;
}

/*
function wavreader(path)
{
    let file = fs.readFileSync(path, 'base64');
    return file;
}
*/
