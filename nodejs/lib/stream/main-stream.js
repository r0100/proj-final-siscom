'use strict'

const fs = require('fs');
const {Transform} = require('stream');
const Speaker = require('speaker');
const wav  = require('wav');
const readder = new wav.Reader();

const { fmiqdemod, } = require('../demodulators'); 

let audio_filter = [0.0261, 0.1402, 0.3337, 0.3337, 0.1402, 0.0261];

//código de teste de wav (o qual será usado) 
let path = "../../../audio_test/SDRSharp_20200718_002948Z_94500000Hz_IQ.wav";

const read_file_stream = fs.createReadStream(path);


const demodulate = new Transform({
    transform(chunk, encoding, cb) {

        //Separate IQ components from  the stereo signal
        let iq = [[], []];
        for(let i = 0; i<chunk.length-1; i+=2) {
            iq[0].push(chunk[i] - 127.5);
            iq[1].push(chunk[i+1] - 127.5);
        }

        //let y = am.amiqdemod(iq, audio_filter);
        //Do the demodulation
        let y = fmiqdemod(iq, audio_filter);
        
        let out_audio_chunk = new Uint8Array(iq[0].length*2)
        let y_mono = [];
        for (let i =0; i<y.length-1; ++i) {
            //Since the final audio data is mono, each channel must be equal
            const rounded_val = Math.round(y[i]*40);
            y_mono.push(rounded_val);
            y_mono.push(rounded_val);
        } 

        out_audio_chunk.set(y_mono);       
        this.push(out_audio_chunk)

        cb();
    }
})

readder.on('format', (format) => {
    console.log(format)

    readder.pipe(demodulate).pipe(new Speaker(format));
})

read_file_stream.pipe(readder);