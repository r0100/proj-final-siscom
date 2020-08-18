'use strict'

let aux = require("../auxiliary");


module.exports = {
    usbiqdemod: usbiqdemod
};

function usbiqdemod(iq, fltr_coef) {
let buffer_size = iq[0].length;
let filter_order = fltr_coef.length;
let y = [];
let tmp = [];

for(let count = 0; count<buffer_size; count++) {
    tmp.push(iq[0][count]+iq[1][count]);
}

/*
if(count>filter_order)
{
    y[count] = fir_filter(tmp, fltr_coef);
    tmp.shift();
}
else
{
    y[count] = tmp[count];
}
*/
y[count] = tmp[count];

return y;
}


//acho que o hilbert não era realmente necessário
/* Código do matlab para referência:
function [y_USB_demodulated] = USB_IQ_Demod(y, b1, b2)
    y_USB_demodulated = 0;
    %b1 = fir1(2, (fc+18000)/fs);
    y_USB_demodulated = filter(b1, 1, y);
    y_USB_demodulated = y_USB_demodulated./abs(y_USB_demodulated);
    y_USB_demodulated = real(y_USB_demodulated) + imag(hilbert(imag(y_USB_demodulated)));
    %b2 = fir1(2, 18000/fs);
    y_USB_demodulated = filter(b2, 1, y_USB_demodulated);
end
*/
