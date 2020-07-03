'use strict'

const fs = require('fs');
const wavefile = require('wavefile');
const {Transform} = require('stream');
const Speaker = require('speaker');
const wav  = require('wav');
const readder = new wav.Reader();

const { fmiqdemod, } = require('../demodulators'); 
const { format } = require('path');

let audio_filter = [0.0261, 0.1402, 0.3337, 0.3337, 0.1402, 0.0261];

//código de teste de wav (o qual será usado) 
let path = "../../../audio_test/teste_100900kHz.wav";

const read_file_stream = fs.createReadStream(path);
const speaker = new Speaker();


const demodulate = new Transform({
    transform(chunk, encoding, cb) {

        let iq = [[], []];

        for(let i = 0; i<chunk.length-1; i+=4) {

            iq[0].push(chunk[i]);

            iq[1].push(chunk[i+1]);

        }

        for(let i = 0; i<iq[0].length; i++)
        {
            iq[0][i] -= 127.5;
            iq[1][i] -= 127.5;
        }
        //let y = am.amiqdemod(iq, audio_filter);
        let y = fmiqdemod(iq, audio_filter);

        let out = new Uint8Array(iq.length*2)
      
        this.push(out)

        cb();
    }
})

readder.on('format', (format) => {
    readder.pipe(demodulate).pipe(speaker)
})

read_file_stream.pipe(readder);