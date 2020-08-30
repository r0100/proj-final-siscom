'use strict'

const fs = require('fs');
const {Transform} = require('stream');
const Speaker = require('speaker');
const wav  = require('wav');
const readder = new wav.Reader();

const RtlSdr = require('./sdr-rtl-stream');

const { spawn } = require('child_process');

const fmiqdemod = require('../demodulators/fmiqdemod'); 

let audio_filter = [0.0261, 0.1402, 0.3337, 0.3337, 0.1402, 0.0261];

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
        let y = fmiqdemod.iqdemod(iq, audio_filter);
        
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

/* const rtl = spawn('rtl_sdr', ['-s 240000', '-f 94100000', "-g 20" ,'-']);

rtl.stdout.pipe(demodulate).pipe(new Speaker({ audioFormat: 1,
    endianness: 'LE',
    channels: 2,
    sampleRate: 240000,
    byteRate: 240000,
    blockAlign: 2,
    bitDepth: 8,
    signed: false }))  */

/* read_file_stream.pipe(demodulate).pipe(new Speaker({ audioFormat: 1,
    endianness: 'LE',
    channels: 2,
    sampleRate: 240000,
    byteRate: 120000,
    blockAlign: 2,
    bitDepth: 8,
    signed: false })); */

const u8_to_f = spawn('csdr', ['convert_u8_f']);
const dem = spawn('csdr', ['fmdemod_quadri_cf']);
const decimator = spawn('csdr', ['fractional_decimator_ff', '5']);
const f_to_s16 = spawn('csdr', ['convert_f_s16']);

const mySdr = new RtlSdr(0);

const streamCache = new StreamCache();
mySdr.start()
mySdr.stream
//.pipe(demodulate)
.pipe(u8_to_f.stdin)
u8_to_f.stdout.pipe(dem.stdin)
dem.stdout.pipe(decimator.stdin)
decimator.stdout.pipe(f_to_s16.stdin)
f_to_s16.stdout.pipe(process.stdout)
