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
		tmp.push((i*q_conv[count] - q*i_conv[count])/(i*i + q*q));
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

},{"../auxiliary":1,"ml-convolution":9}],4:[function(require,module,exports){
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


},{"../../demodulators":4}],8:[function(require,module,exports){
'use strict';

function FFT(size) {
  this.size = size | 0;
  if (this.size <= 1 || (this.size & (this.size - 1)) !== 0)
    throw new Error('FFT size must be a power of two and bigger than 1');

  this._csize = size << 1;

  // NOTE: Use of `var` is intentional for old V8 versions
  var table = new Array(this.size * 2);
  for (var i = 0; i < table.length; i += 2) {
    const angle = Math.PI * i / this.size;
    table[i] = Math.cos(angle);
    table[i + 1] = -Math.sin(angle);
  }
  this.table = table;

  // Find size's power of two
  var power = 0;
  for (var t = 1; this.size > t; t <<= 1)
    power++;

  // Calculate initial step's width:
  //   * If we are full radix-4 - it is 2x smaller to give inital len=8
  //   * Otherwise it is the same as `power` to give len=4
  this._width = power % 2 === 0 ? power - 1 : power;

  // Pre-compute bit-reversal patterns
  this._bitrev = new Array(1 << this._width);
  for (var j = 0; j < this._bitrev.length; j++) {
    this._bitrev[j] = 0;
    for (var shift = 0; shift < this._width; shift += 2) {
      var revShift = this._width - shift - 2;
      this._bitrev[j] |= ((j >>> shift) & 3) << revShift;
    }
  }

  this._out = null;
  this._data = null;
  this._inv = 0;
}
module.exports = FFT;

FFT.prototype.fromComplexArray = function fromComplexArray(complex, storage) {
  var res = storage || new Array(complex.length >>> 1);
  for (var i = 0; i < complex.length; i += 2)
    res[i >>> 1] = complex[i];
  return res;
};

FFT.prototype.createComplexArray = function createComplexArray() {
  const res = new Array(this._csize);
  for (var i = 0; i < res.length; i++)
    res[i] = 0;
  return res;
};

FFT.prototype.toComplexArray = function toComplexArray(input, storage) {
  var res = storage || this.createComplexArray();
  for (var i = 0; i < res.length; i += 2) {
    res[i] = input[i >>> 1];
    res[i + 1] = 0;
  }
  return res;
};

FFT.prototype.completeSpectrum = function completeSpectrum(spectrum) {
  var size = this._csize;
  var half = size >>> 1;
  for (var i = 2; i < half; i += 2) {
    spectrum[size - i] = spectrum[i];
    spectrum[size - i + 1] = -spectrum[i + 1];
  }
};

FFT.prototype.transform = function transform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 0;
  this._transform4();
  this._out = null;
  this._data = null;
};

FFT.prototype.realTransform = function realTransform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 0;
  this._realTransform4();
  this._out = null;
  this._data = null;
};

FFT.prototype.inverseTransform = function inverseTransform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 1;
  this._transform4();
  for (var i = 0; i < out.length; i++)
    out[i] /= this.size;
  this._out = null;
  this._data = null;
};

// radix-4 implementation
//
// NOTE: Uses of `var` are intentional for older V8 version that do not
// support both `let compound assignments` and `const phi`
FFT.prototype._transform4 = function _transform4() {
  var out = this._out;
  var size = this._csize;

  // Initial step (permute and transform)
  var width = this._width;
  var step = 1 << width;
  var len = (size / step) << 1;

  var outOff;
  var t;
  var bitrev = this._bitrev;
  if (len === 4) {
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleTransform2(outOff, off, step);
    }
  } else {
    // len === 8
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleTransform4(outOff, off, step);
    }
  }

  // Loop through steps in decreasing order
  var inv = this._inv ? -1 : 1;
  var table = this.table;
  for (step >>= 2; step >= 2; step >>= 2) {
    len = (size / step) << 1;
    var quarterLen = len >>> 2;

    // Loop through offsets in the data
    for (outOff = 0; outOff < size; outOff += len) {
      // Full case
      var limit = outOff + quarterLen;
      for (var i = outOff, k = 0; i < limit; i += 2, k += step) {
        const A = i;
        const B = A + quarterLen;
        const C = B + quarterLen;
        const D = C + quarterLen;

        // Original values
        const Ar = out[A];
        const Ai = out[A + 1];
        const Br = out[B];
        const Bi = out[B + 1];
        const Cr = out[C];
        const Ci = out[C + 1];
        const Dr = out[D];
        const Di = out[D + 1];

        // Middle values
        const MAr = Ar;
        const MAi = Ai;

        const tableBr = table[k];
        const tableBi = inv * table[k + 1];
        const MBr = Br * tableBr - Bi * tableBi;
        const MBi = Br * tableBi + Bi * tableBr;

        const tableCr = table[2 * k];
        const tableCi = inv * table[2 * k + 1];
        const MCr = Cr * tableCr - Ci * tableCi;
        const MCi = Cr * tableCi + Ci * tableCr;

        const tableDr = table[3 * k];
        const tableDi = inv * table[3 * k + 1];
        const MDr = Dr * tableDr - Di * tableDi;
        const MDi = Dr * tableDi + Di * tableDr;

        // Pre-Final values
        const T0r = MAr + MCr;
        const T0i = MAi + MCi;
        const T1r = MAr - MCr;
        const T1i = MAi - MCi;
        const T2r = MBr + MDr;
        const T2i = MBi + MDi;
        const T3r = inv * (MBr - MDr);
        const T3i = inv * (MBi - MDi);

        // Final values
        const FAr = T0r + T2r;
        const FAi = T0i + T2i;

        const FCr = T0r - T2r;
        const FCi = T0i - T2i;

        const FBr = T1r + T3i;
        const FBi = T1i - T3r;

        const FDr = T1r - T3i;
        const FDi = T1i + T3r;

        out[A] = FAr;
        out[A + 1] = FAi;
        out[B] = FBr;
        out[B + 1] = FBi;
        out[C] = FCr;
        out[C + 1] = FCi;
        out[D] = FDr;
        out[D + 1] = FDi;
      }
    }
  }
};

// radix-2 implementation
//
// NOTE: Only called for len=4
FFT.prototype._singleTransform2 = function _singleTransform2(outOff, off,
                                                             step) {
  const out = this._out;
  const data = this._data;

  const evenR = data[off];
  const evenI = data[off + 1];
  const oddR = data[off + step];
  const oddI = data[off + step + 1];

  const leftR = evenR + oddR;
  const leftI = evenI + oddI;
  const rightR = evenR - oddR;
  const rightI = evenI - oddI;

  out[outOff] = leftR;
  out[outOff + 1] = leftI;
  out[outOff + 2] = rightR;
  out[outOff + 3] = rightI;
};

// radix-4
//
// NOTE: Only called for len=8
FFT.prototype._singleTransform4 = function _singleTransform4(outOff, off,
                                                             step) {
  const out = this._out;
  const data = this._data;
  const inv = this._inv ? -1 : 1;
  const step2 = step * 2;
  const step3 = step * 3;

  // Original values
  const Ar = data[off];
  const Ai = data[off + 1];
  const Br = data[off + step];
  const Bi = data[off + step + 1];
  const Cr = data[off + step2];
  const Ci = data[off + step2 + 1];
  const Dr = data[off + step3];
  const Di = data[off + step3 + 1];

  // Pre-Final values
  const T0r = Ar + Cr;
  const T0i = Ai + Ci;
  const T1r = Ar - Cr;
  const T1i = Ai - Ci;
  const T2r = Br + Dr;
  const T2i = Bi + Di;
  const T3r = inv * (Br - Dr);
  const T3i = inv * (Bi - Di);

  // Final values
  const FAr = T0r + T2r;
  const FAi = T0i + T2i;

  const FBr = T1r + T3i;
  const FBi = T1i - T3r;

  const FCr = T0r - T2r;
  const FCi = T0i - T2i;

  const FDr = T1r - T3i;
  const FDi = T1i + T3r;

  out[outOff] = FAr;
  out[outOff + 1] = FAi;
  out[outOff + 2] = FBr;
  out[outOff + 3] = FBi;
  out[outOff + 4] = FCr;
  out[outOff + 5] = FCi;
  out[outOff + 6] = FDr;
  out[outOff + 7] = FDi;
};

// Real input radix-4 implementation
FFT.prototype._realTransform4 = function _realTransform4() {
  var out = this._out;
  var size = this._csize;

  // Initial step (permute and transform)
  var width = this._width;
  var step = 1 << width;
  var len = (size / step) << 1;

  var outOff;
  var t;
  var bitrev = this._bitrev;
  if (len === 4) {
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleRealTransform2(outOff, off >>> 1, step >>> 1);
    }
  } else {
    // len === 8
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleRealTransform4(outOff, off >>> 1, step >>> 1);
    }
  }

  // Loop through steps in decreasing order
  var inv = this._inv ? -1 : 1;
  var table = this.table;
  for (step >>= 2; step >= 2; step >>= 2) {
    len = (size / step) << 1;
    var halfLen = len >>> 1;
    var quarterLen = halfLen >>> 1;
    var hquarterLen = quarterLen >>> 1;

    // Loop through offsets in the data
    for (outOff = 0; outOff < size; outOff += len) {
      for (var i = 0, k = 0; i <= hquarterLen; i += 2, k += step) {
        var A = outOff + i;
        var B = A + quarterLen;
        var C = B + quarterLen;
        var D = C + quarterLen;

        // Original values
        var Ar = out[A];
        var Ai = out[A + 1];
        var Br = out[B];
        var Bi = out[B + 1];
        var Cr = out[C];
        var Ci = out[C + 1];
        var Dr = out[D];
        var Di = out[D + 1];

        // Middle values
        var MAr = Ar;
        var MAi = Ai;

        var tableBr = table[k];
        var tableBi = inv * table[k + 1];
        var MBr = Br * tableBr - Bi * tableBi;
        var MBi = Br * tableBi + Bi * tableBr;

        var tableCr = table[2 * k];
        var tableCi = inv * table[2 * k + 1];
        var MCr = Cr * tableCr - Ci * tableCi;
        var MCi = Cr * tableCi + Ci * tableCr;

        var tableDr = table[3 * k];
        var tableDi = inv * table[3 * k + 1];
        var MDr = Dr * tableDr - Di * tableDi;
        var MDi = Dr * tableDi + Di * tableDr;

        // Pre-Final values
        var T0r = MAr + MCr;
        var T0i = MAi + MCi;
        var T1r = MAr - MCr;
        var T1i = MAi - MCi;
        var T2r = MBr + MDr;
        var T2i = MBi + MDi;
        var T3r = inv * (MBr - MDr);
        var T3i = inv * (MBi - MDi);

        // Final values
        var FAr = T0r + T2r;
        var FAi = T0i + T2i;

        var FBr = T1r + T3i;
        var FBi = T1i - T3r;

        out[A] = FAr;
        out[A + 1] = FAi;
        out[B] = FBr;
        out[B + 1] = FBi;

        // Output final middle point
        if (i === 0) {
          var FCr = T0r - T2r;
          var FCi = T0i - T2i;
          out[C] = FCr;
          out[C + 1] = FCi;
          continue;
        }

        // Do not overwrite ourselves
        if (i === hquarterLen)
          continue;

        // In the flipped case:
        // MAi = -MAi
        // MBr=-MBi, MBi=-MBr
        // MCr=-MCr
        // MDr=MDi, MDi=MDr
        var ST0r = T1r;
        var ST0i = -T1i;
        var ST1r = T0r;
        var ST1i = -T0i;
        var ST2r = -inv * T3i;
        var ST2i = -inv * T3r;
        var ST3r = -inv * T2i;
        var ST3i = -inv * T2r;

        var SFAr = ST0r + ST2r;
        var SFAi = ST0i + ST2i;

        var SFBr = ST1r + ST3i;
        var SFBi = ST1i - ST3r;

        var SA = outOff + quarterLen - i;
        var SB = outOff + halfLen - i;

        out[SA] = SFAr;
        out[SA + 1] = SFAi;
        out[SB] = SFBr;
        out[SB + 1] = SFBi;
      }
    }
  }
};

// radix-2 implementation
//
// NOTE: Only called for len=4
FFT.prototype._singleRealTransform2 = function _singleRealTransform2(outOff,
                                                                     off,
                                                                     step) {
  const out = this._out;
  const data = this._data;

  const evenR = data[off];
  const oddR = data[off + step];

  const leftR = evenR + oddR;
  const rightR = evenR - oddR;

  out[outOff] = leftR;
  out[outOff + 1] = 0;
  out[outOff + 2] = rightR;
  out[outOff + 3] = 0;
};

// radix-4
//
// NOTE: Only called for len=8
FFT.prototype._singleRealTransform4 = function _singleRealTransform4(outOff,
                                                                     off,
                                                                     step) {
  const out = this._out;
  const data = this._data;
  const inv = this._inv ? -1 : 1;
  const step2 = step * 2;
  const step3 = step * 3;

  // Original values
  const Ar = data[off];
  const Br = data[off + step];
  const Cr = data[off + step2];
  const Dr = data[off + step3];

  // Pre-Final values
  const T0r = Ar + Cr;
  const T1r = Ar - Cr;
  const T2r = Br + Dr;
  const T3r = inv * (Br - Dr);

  // Final values
  const FAr = T0r + T2r;

  const FBr = T1r;
  const FBi = -T3r;

  const FCr = T0r - T2r;

  const FDr = T1r;
  const FDi = T3r;

  out[outOff] = FAr;
  out[outOff + 1] = 0;
  out[outOff + 2] = FBr;
  out[outOff + 3] = FBi;
  out[outOff + 4] = FCr;
  out[outOff + 5] = 0;
  out[outOff + 6] = FDr;
  out[outOff + 7] = FDi;
};

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var FFT = _interopDefault(require('fft.js'));
var nextPOT = _interopDefault(require('next-power-of-two'));

function checkSize(size) {
  if (!Number.isInteger(size) || size < 1) {
    throw new TypeError(`size must be a positive integer. Got ${size}`);
  }
}

function checkKernel(kernel) {
  if (kernel.length === 0 || kernel.length % 2 !== 1) {
    throw new RangeError(
      `kernel must have an odd positive length. Got ${kernel.length}`
    );
  }
}

function checkBorderType(borderType) {
  if (borderType !== 'CONSTANT' && borderType !== 'CUT') {
    throw new RangeError(`unexpected border type: ${borderType}`);
  }
}

function checkInputLength(actual, expected) {
  if (actual !== expected) {
    throw new RangeError(
      `input length (${actual}) does not match setup size (${expected})`
    );
  }
}

function createArray(len) {
  const array = [];
  for (var i = 0; i < len; i++) {
    array.push(0);
  }
  return array;
}

class DirectConvolution {
  constructor(size, kernel, borderType = 'CONSTANT') {
    checkSize(size);
    checkKernel(kernel);
    checkBorderType(borderType);

    this.size = size;
    this.kernelOffset = (kernel.length - 1) / 2;
    this.outputSize =
      borderType === 'CONSTANT' ? size : size - 2 * this.kernelOffset;
    this.output = createArray(this.outputSize);
    this.kernel = kernel;
    this.kernelSize = kernel.length;
    this.borderType = borderType;
  }

  convolve(input) {
    checkInputLength(input.length, this.size);
    this.output.fill(0);
    if (this.borderType === 'CONSTANT') {
      this._convolutionBorder0(input);
    } else {
      this._convolutionBorderCut(input);
    }
    return this.output;
  }

  _convolutionBorder0(input) {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.kernelSize; j++) {
        this.output[i] +=
          interpolateInput(input, i - this.kernelOffset + j) * this.kernel[j];
      }
    }
  }

  _convolutionBorderCut(input) {
    for (let i = this.kernelOffset; i < this.size - this.kernelOffset; i++) {
      const index = i - this.kernelOffset;
      for (let j = 0; j < this.kernelSize; j++) {
        this.output[index] += input[index + j] * this.kernel[j];
      }
    }
  }
}

function directConvolution(input, kernel, borderType) {
  return new DirectConvolution(input.length, kernel, borderType).convolve(
    input
  );
}

function interpolateInput(input, idx) {
  if (idx < 0) return 0;
  else if (idx >= input.length) return 0;
  return input[idx];
}

class FFTConvolution {
  constructor(size, kernel, borderType = 'CONSTANT') {
    checkSize(size);
    checkKernel(kernel);
    checkBorderType(borderType);

    this.size = size;
    this.kernelOffset = (kernel.length - 1) / 2;
    this.doubleOffset = 2 * this.kernelOffset;
    this.borderType = borderType;
    const resultLength = size + this.doubleOffset;
    this.fftLength = nextPOT(Math.max(resultLength, 2));
    this.fftComplexLength = this.fftLength * 2;
    this.fft = new FFT(this.fftLength);

    kernel = kernel.slice().reverse();
    const paddedKernel = createArray(this.fftComplexLength);
    this.fftKernel = createArray(this.fftComplexLength);
    pad(kernel, paddedKernel, this.fftComplexLength);
    this.fft.transform(this.fftKernel, paddedKernel);

    this.paddedInput = createArray(this.fftComplexLength);
    this.fftInput = createArray(this.fftComplexLength);

    this.ifftOutput = createArray(this.fftComplexLength);
    this.result = paddedKernel;
  }

  convolve(input) {
    checkInputLength(input.length, this.size);
    pad(input, this.paddedInput, this.fftComplexLength);
    this.fft.transform(this.fftInput, this.paddedInput);

    for (var i = 0; i < this.fftInput.length; i += 2) {
      const tmp =
        this.fftInput[i] * this.fftKernel[i] -
        this.fftInput[i + 1] * this.fftKernel[i + 1];
      this.fftInput[i + 1] =
        this.fftInput[i] * this.fftKernel[i + 1] +
        this.fftInput[i + 1] * this.fftKernel[i];
      this.fftInput[i] = tmp;
    }

    this.fft.inverseTransform(this.ifftOutput, this.fftInput);
    const r = this.fft.fromComplexArray(this.ifftOutput, this.result);
    if (this.borderType === 'CONSTANT') {
      return r.slice(this.kernelOffset, this.kernelOffset + input.length);
    } else {
      return r.slice(this.doubleOffset, input.length);
    }
  }
}

function fftConvolution(input, kernel, borderType) {
  return new FFTConvolution(input.length, kernel, borderType).convolve(input);
}

function pad(data, out, len) {
  let i = 0;
  for (; i < data.length; i++) {
    out[i * 2] = data[i];
    out[i * 2 + 1] = 0;
  }

  i *= 2;
  for (; i < len; i += 2) {
    out[i] = 0;
    out[i + 1] = 0;
  }
}

const BorderType = {
  CONSTANT: 'CONSTANT',
  CUT: 'CUT'
};

exports.BorderType = BorderType;
exports.DirectConvolution = DirectConvolution;
exports.FFTConvolution = FFTConvolution;
exports.directConvolution = directConvolution;
exports.fftConvolution = fftConvolution;

},{"fft.js":8,"next-power-of-two":10}],10:[function(require,module,exports){
module.exports = nextPowerOfTwo

function nextPowerOfTwo (n) {
  if (n === 0) return 1
  n--
  n |= n >> 1
  n |= n >> 2
  n |= n >> 4
  n |= n >> 8
  n |= n >> 16
  return n+1
}
},{}]},{},[7]);
