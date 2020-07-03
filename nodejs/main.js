'use strict'

const fs = require('fs');
const wavefile = require('wavefile');
let wav = new wavefile.WaveFile();

const aux = require('./auxiliary');
const am = require('./amiqdemod');
const fm = require('./fmiqdemod');
const lsb = require('./lsbiqdemod');
const usb = require('./usbiqdemod');

//código de teste de binário (que vai ser usado para o rtl-sdr)
//let path = "Hadouken.bin";
//let file = fs.readFileSync(path);
//console.log(file); 

//falta fazer uma função para leitura de binários


//código de teste de wav (o qual será usado) 
let path = "audiomod.wav";
wav.fromBase64(aux.wavreader(path));
let audio = wav.getSamples();
let iq = [audio[0, 0], audio[0, 1]];
for(let i = 0; i<iq[0].length; i++)
{
    iq[0][i] -= 127.5;
    iq[1][i] -= 127.5;
}

//coeficientes calculados no matlab
let audio_filter = [0.0261, 0.1402, 0.3337, 0.3337, 0.1402, 0.0261];
//let audio_filter = [1, 0, 0];
let fm_filter = [0.0005, -0.0017, 0.0032, -0.0052, 0.0079, -0.0115, 0.0162, -0.0223, 0.0302, -0.0406, 0.0548, -0.0752, 
0.1077, -0.1699, 0.3502, 0, -0.3502, 0.1699, -0.1077, 0.0752, -0.0548, 0.0406, -0.0302, 0.0223,
-0.0162, 0.0115, -0.0079, 0.0052, -0.0032, 0.0017, -0.0005];

//aprender como calcular esses
//let lsb_filter = [];
//let usb_filter = [];

//let y = am.amiqdemod(iq, audio_filter);
let y = fm.fmiqdemod(iq, fm_filter, audio_filter);
console.log(y);

wav.data.samples = y;
wav.fmt.sampleRate = 75000; //não entendi o porquê, mas tem que reduzir a freq. de amost. por 2 para funcionar
wav.fmt.byteRate = 150000; //para ficar igual ao byteRate do arquivo audiooriginal.wav 
//console.log(wav);


let file = wav.toBuffer();
//fs.writeFileSync("audiodmdam.wav", file);
fs.writeFileSync("audiodmdfm.wav", file);
