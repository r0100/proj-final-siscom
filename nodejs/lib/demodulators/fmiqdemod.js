'use strict'

let aux = require("../auxiliary");
let cnv = require("ml-convolution");
let fm_filter = [0.0005, -0.0017, 0.0032, -0.0052, 0.0079, -0.0115, 0.0162, -0.0223, 0.0302, -0.0406, 0.0548, -0.0752, 
0.1077, -0.1699, 0.3502, 0, -0.3502, 0.1699, -0.1077, 0.0752, -0.0548, 0.0406, -0.0302, 0.0223,
-0.0162, 0.0115, -0.0079, 0.0052, -0.0032, 0.0017, -0.0005];

module.exports = {
    iqdemod: fmiqdemod
};

function fmiqdemod(iq, fltr_coef) {
	let buffer_size = iq[0].length;
	let y = [];
	let tmp = [];
	let offset = 0;
	
	for(let count = 0; count<buffer_size; count++) {
		let abs = Math.sqrt(iq[0][count]*iq[0][count] + iq[1][count]*iq[1][count]);
		iq[0][count] /= abs;
		iq[1][count] /= abs;
	}

	let i_conv = cnv.fftConvolution(iq[0], fm_filter);
	let q_conv = cnv.fftConvolution(iq[1], fm_filter);
	let filter_order = fltr_coef.length;

	for(let count = 0; count<buffer_size; count++) {
		let i = iq[0][count];
		let q = iq[1][count];
		tmp.push((i*q_conv[count] - q*i_conv[count])/(i*i + q*q)/5);
		//tmp.push((i*q_conv[count] - q*i_conv[count])/10);
		if(count>filter_order) {
			y[count] = aux.fir_filter(tmp, fltr_coef);
			tmp.shift();
		} else {
			y[count] = tmp[count];
		}
		offset += y[count]/buffer_size; //toma o offset do sinal
	}

	for(let count = 0; count<buffer_size; count++)
		y[count]-=offset;

	return y;
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
