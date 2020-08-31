'use strict'

let aux = require("../auxiliary");

module.exports = {
    iqdemod: fmiqdemod
};

function fmiqdemod(iq) {
	let buffer_size = iq[0].length;
	let y = [];
	let tmp = [];
	const CORR_FACTOR = 0.340447550238101026565118445432744920253753662109375; //retirado do código do csdr
	
	for(let count = 0; count<buffer_size; count++) {
		let i = iq[0][count];
		let q = iq[1][count];
		let di = count===0?i:(iq[0][count]-iq[0][count-1]);
		let dq = count===0?q:(iq[1][count]-iq[1][count-1]);
		let den = i*i + q*q;
		tmp.push( (den===0)?0:CORR_FACTOR*(i*dq - q*di)/den );
		/* 
		if(count>filter_order) {
			y[count] = aux.fir_filter(tmp, fltr_coef);
			tmp.shift();
		} else {
			y[count] = tmp[count];
		}
		offset += y[count]/buffer_size; //toma o offset do sinal */
	}

	/* for(let count = 0; count<buffer_size; count++)
		y[count]-=offset; */

	return tmp;
}


/* Código do matlab para referência:
function [y_FM_demodulated] = FM_IQ_Demod(y, b1, b2)
    %This function demodualtes an FM signal. It is assumed that the FM signal
    %is complex (i.e. an IQ signal) centered at DC and occupies less than 90%
    %of total bandwidth. 
    
    %b = firls(30,[0 .9],[0 1],'differentiator'); %design differentiater 
    
    %d=y./abs(y);%normalize the amplitude (i.e. remove amplitude variations) 
    rd=real(y); %real part of normalized siganl. 
    id=imag(y); %imaginary part of normalized signal.  

    y_FM_demodulated=(rd.*conv(id,b1,'same')-id.*conv(rd,b1,'same'))./(rd.^2+id.^2); %demodulate!
    y_FM_demodulated = filter(b2, 1, y_FM_demodulated);
end
*/
