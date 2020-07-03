'use strict'

let aux = require("../auxiliary");
let cnv = require("ml-convolution")


module.exports = {
    fmiqdemod: function(iq, fltr_coef1, fltr_coef2)
    {
        let buffer_size = iq[0].length;
        let y = [];
        let tmp = [];
        let min = 0;
        //let i_conv = aux.conv(iq[0], fltr_coef1);
        //let q_conv = aux.conv(iq[1], fltr_coef1);
        let i_conv = cnv.fftConvolution(iq[0], fltr_coef1);
        let q_conv = cnv.fftConvolution(iq[1], fltr_coef1);
        let filter_order = fltr_coef2.length;


        for(let count = 0; count<buffer_size; count++)
        {
            let i = iq[0][count];
            let q = iq[1][count];

            tmp.push((i*q_conv[count] - q*i_conv[count])/(i*i + q*q));

            if(count>filter_order)
            {
                y[count] = aux.fir_filter(tmp, fltr_coef2);
                tmp.shift();
            }
            else
                y[count] = tmp[count];

            min = (min<y[count])?min:y[count]; //toma o menor valor do sinal 

        }

        for(let count = 0; count<buffer_size; count++)
            y[count]-=min; //retira o menor valor encontrado, de forma a tirar o offset sem tornar o sinal negativo 

        return y;
    }
};

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
