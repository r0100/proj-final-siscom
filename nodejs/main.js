'use strict'

const fs = require('fs');
const wavefile = require('wavefile');
let wav = new wavefile.WaveFile();

const aux = require('./lib/auxiliary');

const {
    fmiqdemod,
    amiqdemod,
    usbiqdemod,
    lsbiqdemod
} = require('./lib/demodulators'); 

//código de teste de binário (que vai ser usado para o rtl-sdr)
//let path = "Hadouken.bin";
//let file = fs.readFileSync(path);
//console.log(file); 

//falta fazer uma função para leitura de binários


//código de teste de wav (o qual será usado) 
let path = "../audio_test/teste_100900kHz.wav";
wav.fromBase64(aux.wavreader(path));
let audio = wav.getSamples();
let iq = [audio[0, 0], audio[0, 1]];
console.log(iq)
for(let i = 0; i<iq[0].length; i++)
{
    iq[0][i] -= 127.5;
    iq[1][i] -= 127.5;
}

//let y = am.amiqdemod(iq, audio_filter);
let y = fmiqdemod(iq, aux.audio_filter);
wav.data.samples = y;
wav.fmt.sampleRate = 75000; //não entendi o porquê, mas tem que reduzir a freq. de amost. por 2 para funcionar
wav.fmt.byteRate = 150000; //para ficar igual ao byteRate do arquivo audiooriginal.wav 

let file = wav.toBuffer();
fs.writeFileSync("audiodmdfm.wav", file);
