(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
'use strict'

let aux = require('../auxiliary'); 

module.exports = {
	iqdemod: amiqdemod
}

function amiqdemod(iq, fltr_coef)
{
	let offset = 0;
	let buffer_size = iq[0].length;
	let filter_order = fltr_coef.length;
	let y = [];
	let tmp = [];
	for(let count = 0; count<buffer_size; count++) { 
		let i = iq[0][count];
		let q = iq[1][count];
		tmp.push(Math.sqrt(i*i + q*q)); //tira a magnitude da amostra IQ
		//filtro
		if(count>filter_order) {
			y[count] = aux.fir_filter(tmp, fltr_coef);
			tmp.shift();
		} else {
			y[count] = tmp[count];
		}
		//min = (min<y[count])?min:y[count]; //toma o menor valor do sinal 
		offset += y[count]/buffer_size;
	}
	for(let count = 0; count<buffer_size; count++)
		y[count]-=offset; //retira o offset do sinal
	return y;
}

/* Código do matlab para referência:
function [y_AM_demodulated] = AM_IQ_Demod(y, fs)
    [b, a] = butter(2, 18000/fs);
    y_AM_demodulated = abs(y);
    y_AM_demodulated = filter(b, a, y_AM_demodulated);
    y_AM_demodulated = detrend(y_AM_demodulated);
end
*/

},{"../auxiliary":1}],3:[function(require,module,exports){
'use strict'

let aux = require("../auxiliary");

module.exports = {
    iqdemod: fmiqdemod
};

function fmiqdemod(iq, fltr_coef) {
	let buffer_size = iq[0].length;
	let y = [];
	let tmp = [];
	let offset = 0;
	const CORR_FACTOR = 0.340447550238101026565118445432744920253753662109375; //retirado do código do csdr
	
	let filter_order = fltr_coef.length;

	for(let count = 0; count<buffer_size; count++) {
		let i = iq[0][count];
		let q = iq[1][count];
		let di = count===0?i:(iq[0][count]-iq[0][count-1]);
		let dq = count===0?q:(iq[1][count]-iq[1][count-1]);
		let den = i*i + q*q;
		tmp.push( (den===0)?0:CORR_FACTOR*(i*dq - q*di)/den );
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

},{"../auxiliary":1}],4:[function(require,module,exports){
module.exports = {
    ...require('./amiqdemod'),
    ...require('./fmiqdemod'),
    ...require('./lsbiqdemod'),
    ...require('./usbiqdemod'),
};

},{"./amiqdemod":2,"./fmiqdemod":3,"./lsbiqdemod":5,"./usbiqdemod":6}],5:[function(require,module,exports){
'use strict'

let aux = require("../auxiliary");

module.exports = {
    iqdemod: lsbiqdemod
};

function lsbiqdemod(iq, fltr_coef) {
	let buffer_size = iq[0].length;
	let filter_order = fltr_coef.length;
	let y = [];
	let tmp = [];
	for(let count = 0; count<buffer_size; count++) {
		tmp.push(iq[0][count]-iq[1][count]);
		if(count>filter_order) {
			y[count] = aux.fir_filter(tmp, fltr_coef);
			tmp.shift();
		} else {
			y[count] = tmp[count];
		}
	}
	return y;
}

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

},{"../auxiliary":1}],6:[function(require,module,exports){
'use strict'

let aux = require("../auxiliary");


module.exports = {
    iqdemod: usbiqdemod
};

function usbiqdemod(iq, fltr_coef) {
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

},{"../auxiliary":1}],7:[function(require,module,exports){
const {am, fm, lsb, usb} = require('../../demodulators');

const playButton = document.querySelector('button');

// Create AudioContext and buffer source
let audioCtx;
let source;

function init() {
    audioCtx = new AudioContext();
    source = audioCtx.createBufferSource();

    // Create a ScriptProcessorNode with a bufferSize of 4096 and a single input and output channel
    let scriptNode = audioCtx.createScriptProcessor(4096, 2, 2);
    console.log(scriptNode.bufferSize);

    // load in an audio track via XHR and decodeAudioData

    function getData() {
        request = new XMLHttpRequest();
        request.open('GET', '/audio', true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
        let audioData = request.response;

        audioCtx.decodeAudioData(audioData, function(buffer) {
            myBuffer = buffer;
        source.buffer = myBuffer;
        },
        function(e){"Error with decoding audio data" + e.err});
        }
        request.send();
    }

    // Give the node a function to process audio events
    scriptNode.onaudioprocess = function(audioProcessingEvent) {
        // The input buffer is the song we loaded earlier
        let inputBuffer = audioProcessingEvent.inputBuffer;

        // The output buffer contains the samples that will be modified and played
        let outputBuffer = audioProcessingEvent.outputBuffer;

        let iq = [inputBuffer.getChannelData(0), inputBuffer.getChannelData(1)];
       /*  for(let i = 0; i<inputBuffer.length; i++) {
            iq[0][i] -=127.5;
            iq[1][i] -=127.5;
        }  */

        //Do the demodulation
        let audio_filter = [0.0261, 0.1402, 0.3337, 0.3337, 0.1402, 0.0261];

        let y = fm.iqdemod(iq, audio_filter);
        let outChannelData1 = outputBuffer.getChannelData(0);
        let outChannelData2 = outputBuffer.getChannelData(1);
        console.log(y)

        for (let i = 0; i < outChannelData1.length; ++i) {
            outChannelData1[i] = y[i]/40
            outChannelData2[i] = y[i]/40
        }
    }

    getData();

    source.connect(scriptNode);
    scriptNode.connect(audioCtx.destination);
    source.start();

    // When the buffer source stops playing, disconnect everything
    source.onended = function() {
        source.disconnect(scriptNode);
        scriptNode.disconnect(audioCtx.destination);
    }

}

// wire up play button
playButton.onclick = function() {
    if(!audioCtx) {
        init();
    }
}


},{"../../demodulators":4}]},{},[7]);
