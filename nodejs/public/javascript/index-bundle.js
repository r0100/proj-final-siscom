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

},{"../auxiliary":1}],4:[function(require,module,exports){
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

},{"../auxiliary":1}],5:[function(require,module,exports){
'use strict'

let aux = require("../auxiliary");

module.exports = {
    iqdemod: noiqdemod
};

function noiqdemod(iq, fltr_coef) {
    let buffer_size = iq[0].length;
    let filter_order = fltr_coef.length;
    let y = [];
    let tmp = [];

    for(let count = 0; count<buffer_size; count++) {
        tmp.push(iq[0][count]);

        if(count>filter_order) {
            y[count] = aux.fir_filter(tmp, fltr_coef);
            tmp.shift();
        }
        else {
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
const am = require('../../demodulators/amiqdemod.js');
const fm = require('../../demodulators/fmiqdemod.js');
const lsb = require('../../demodulators/lsbiqdemod.js');
const usb = require('../../demodulators/usbiqdemod.js');
const no = require('../../demodulators/noiqdemod.js');
const aux = require('../../auxiliary.js');

'use strict'

const AUDIO = '/audio';
//const LPF = 16000;
//const NO_FILTER = 22050;
const LPF = aux.audio_filter;
const NO_FILTER = [1, 0, 0];
const BUFFER_SIZE = 4096;
const FS = 150000;

let ctx;
let source;
let demod;
let filter;
let volume;
let demodMethod = 'nenhum';


module.exports = {
	ctx: ctx,
	playPause: playPause,
	updateVolume: updateVolume,
	updateDemod: updateDemod,
	updateFilter: updateFilter
}

function initAudio() {
	let audioContext = window.AudioContext||window.webkitAudioContext;
	ctx = new AudioContext({latencyHint: 'interactive', sampleRate: FS});
	source = ctx.createBufferSource();
	demod = ctx.createScriptProcessor(BUFFER_SIZE, 2, 2);
	volume = ctx.createGain();
	filter = LPF;
	volume.gain.setValueAtTime(0.5, ctx.currentTime);

	function getAudio() {
		request = new XMLHttpRequest();
		request.open('GET', AUDIO, true);
		request.responseType = 'arraybuffer';
		request.onload = function() {
			let audioData = request.response;
			ctx.decodeAudioData(audioData, function(buffer) {
				myBuffer = buffer;
				source.buffer = myBuffer;
			},
			function(e){"Error with decoding audio data" + e.err});
		}
		request.send();
	}

	demod.onaudioprocess = function(audioProcessingEvent) {
		if(filter==null) filter = LPF;
		let inputBuffer = audioProcessingEvent.inputBuffer;
		let outputBuffer = audioProcessingEvent.outputBuffer;

		let iq = [inputBuffer.getChannelData(0), inputBuffer.getChannelData(1)];

		switch(demodMethod) {
			case 'am':
				//console.log('am');
				y = am.iqdemod(iq, filter);
				break;
			case 'fm':
				//console.log('fm');
				y = fm.iqdemod(iq, filter);
				break;
			case 'lsb':
				//console.log('lsb');
				y = lsb.iqdemod(iq, filter);
				break;
			case 'usb':
				//console.log('usb');
				y = usb.iqdemod(iq, filter);
				break;
			default:
				y = no.iqdemod(iq, filter);
				break;
		}
		//console.log('Vetor de saída: ');
		//console.log(y);
		let outData = [outputBuffer.getChannelData(0), outputBuffer.getChannelData(1)];
		for(let i = 0; i<outData[0].length; i++) {
			outData[0][i] = y[i];
			outData[1][i] = y[i];
		}
	}

	getAudio();

	source.loop = true;
	source.connect(demod).connect(volume).connect(ctx.destination);
	source.start();
}

function playPause(onoff, vol) {
	if(onoff==='on') {
		updateVolume(vol);
		initAudio();
	} else {
		volume.gain.setValueAtTime(0, ctx.currentTime);
		source.disconnect()
		demod.disconnect()
		volume.disconnect()
		ctx.destination.disconnect();
		ctx = null;
		volume = null;
		source=null;
		filter=null;
	}
}

function updateVolume(vol) {
	console.log('Novo valor de volume: ' + vol);
	if(volume)
		volume.gain.setValueAtTime(Number(vol)/100, ctx.currentTime);
}

function updateDemod(method) {
	console.log('Mudando para demodulação ' + method);
	demodMethod = method;
}

function updateFilter(fltCond) {
	console.log('Filtro em ' + fltCond);
	if(!filter)
		return;

	if(fltCond==='on') {
		filter = LPF
	} else {
		filter = NO_FILTER;
	}
	console.log(filter);
}

},{"../../auxiliary.js":1,"../../demodulators/amiqdemod.js":2,"../../demodulators/fmiqdemod.js":3,"../../demodulators/lsbiqdemod.js":4,"../../demodulators/noiqdemod.js":5,"../../demodulators/usbiqdemod.js":6}],8:[function(require,module,exports){
'use strict'

let usr_cfg = {
    onoff: "off",
    vol: "50",
    frq: (85+110)/2,
    bndeq: 16,
    bnddr: 16,
    dmd: "nenhum",
    flt: true,
};

module.exports = {
	usr_cfg: usr_cfg,
	returnInfoText: returnInfoText,
	printAll: printAll,
	initInfo: initInfo,
	updateInfoText: updateInfoText,
	sendBandServer: sendBandServer
}

function returnInfoText(code, value) {
	let text = "";
	switch(code) {
		case "onoff":
			text = "Status: " + ((value==="on")?"Ligado":"Desligado");
			break;
		case "vol":
			text = "Volume: "+value+"%";
			break;
		case "frq":
			text = "Frequência Central: "+value+"MHz";
			break;
		case "bndeq":
			text = "Banda Esquerda: "+value+"MHz";
			break;
		case "bnddr":
			text = "Banda Direita: "+value+"MHz";
			break;
		case "dmd":
			text = "Método de Demodulação: " + ((value==="nenhum")?(value[0].toUpperCase()+value.substr(1)):value.toUpperCase());
			break;
		case "flt":
			text = "Filtro anti-ruído: "+((value==='on')?"Ligado":"Desligado");
			break;
		default:
			text = "ERRO!";
			break;
	}
	return text;
}

function printAll() {
	Object.keys(usr_cfg).forEach((key) => console.log(key + ' = ' + usr_cfg[key]));
}

function initInfo() {
	Object.keys(usr_cfg).forEach((key) => {
		document.getElementById(key+'show').innerHTML = returnInfoText(key, usr_cfg[key]);
	});
}

function updateInfoText(param) {
	document.getElementById(param.id + 'show').innerHTML = returnInfoText(param.id, param.value);
	return param.value;
}

function sendBandServer(cond) {
    if(!cond)
		return;

	let url = "/update-frq?frq=" + usr_cfg.frq + "&bndeq=" + usr_cfg.bndeq + "&bnddr=" + usr_cfg.bnddr;
	let ajax = new XMLHttpRequest();
	ajax.open("GET", url, true);
	ajax.setRequestHeader('Content-Type', 'charset=utf-8');
	ajax.send();
}

},{}],9:[function(require,module,exports){
const aump = require('./audio-manip.js');
const info = require('./interface-update.js');

document.addEventListener('DOMContentLoaded', () => {
	//código relacionado com a parte do painel no topo da página
	info.initInfo();

	let infoElementIds = ['on-off-sect', 'vol', 'frq', 'bndeq', 'bnddr', 'dmd-sect', 'flt'];
	infoElementIds.forEach((id) => {
		function callUpdate() {
			if(id==='flt')
				event.target.value = (event.target.checked===true)?'on':'off';

			info.usr_cfg[event.target.id] = info.updateInfoText(event.target);			

			switch(event.target.id) {
				case 'onoff':
					aump.playPause(event.target.value, info.usr_cfg.vol);
					break;
				case 'vol':
					aump.updateVolume(event.target.value);
					break;
				case 'frq':
				case 'bndeq':
				case 'bnddr':
					info.sendBandServer(true);
					break;
				case 'dmd':
					aump.updateDemod(event.target.value);
					break;
				case 'flt':
					aump.updateFilter(event.target.value);
					break;
			}
		}

		switch(id) {
			case 'vol':
			case 'frq':
			case 'bndeq':
			case 'bnddr':
				getById(id).onmousemove = callUpdate;
			case 'on-off-sect':
			case 'dmd-sect':
			case 'flt':
				getById(id).onchange = callUpdate;
		}
	});
});

function getById(id) {
	return document.getElementById(id);
}

},{"./audio-manip.js":7,"./interface-update.js":8}]},{},[9]);
