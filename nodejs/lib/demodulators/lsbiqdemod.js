'use strict'

let aux = require("../auxiliary");

module.exports = {
    lsbiqdemod: function(iq, fltr_coef)
    {
	let buffer_size = iq[0].length;
	let filter_order = fltr_coef.length;
	let y = [];
	let tmp = [];

	for(let count = 0; count<buffer_size; count++)
	{
	    tmp.push(iq[0][count]-iq[1][count]);
	}

	if(count>filter_order)
	{
	    y[count] = fir_filter(tmp, fltr_coef);
	    tmp.shift();
	}
	else
	{
	    y[count] = tmp[count];
	}

	return y;
    }
};

//acho que o hilbert não era realmente necessário
/* Código do matlab para referência:
function [y_LSB_demodulated] = LSB_IQ_Demod(y, b1, b2)
    y_LSB_demodulated = 0;
    %b1 = fir1(2, (fc+1000)/fs);
    y_LSB_demodulated = filter(b1, 1, y);
    y_LSB_demodulated = y_LSB_demodulated./abs(y_LSB_demodulated);
    y_LSB_demodulated = real(y_LSB_demodulated) - imag(hilbert(imag(y_LSB_demodulated)));
    %b2 = fir1(2, 18000/fs);
    y_LSB_demodulated = filter(b2, 1, y_LSB_demodulated);
end
*/
