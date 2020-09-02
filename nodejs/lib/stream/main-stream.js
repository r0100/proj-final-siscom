'use strict'

const {Transform} = require('stream');
const RtlSdr = require('./sdr-rtl-stream');
const { spawn } = require('child_process');
const fmiqdemod = require('../demodulators/fmiqdemod'); 
const amiqdemod = require('../demodulators/amiqdemod'); 

//const path = require('path')
//const audio_path = path.join(__dirname, './test');


function convert_u8_f(chunk) {
    let u8Buffer = new Uint8Array(chunk);
    let fArray = [];


    for (let i = 0; i < chunk.length; ++i) {
        fArray.push((u8Buffer[i]/(255/2)) - 1);

    }
    return new Float32Array(fArray);
}

class DemodulateStream extends Transform {

    constructor() {
        super({
            transform(chunk, encoding, cb) {
                //Separate IQ components from  the stereo signal
              /*   let iq = [[], []];
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
                    const rounded_val = Math.round(y[i]*40) +127.5;
                    y_mono.push(rounded_val);
                    y_mono.push(rounded_val);
                } 
        
                out_audio_chunk.set(y_mono); 
                const f_chunk = convert_u8_f(Buffer.from(out_audio_chunk.buffer))
                this.push(Buffer.from(f_chunk.buffer)) */
        
        
                let iq = [[], []];
                let f_chunk = convert_u8_f(chunk)
        
                
                for(let i = 0; i < f_chunk.length; i+=2) {
                    iq[0].push(f_chunk[i]);
                    iq[1].push(f_chunk[i+1]);
                }
        
                let y;
        
                switch (this.type) {
                    case 'fm':
                        y = fmiqdemod.iqdemod(iq);
                        break;
                
                    case 'am':
                        y = amiqdemod.iqdemod(iq);
                        break;
                    default:
                        y = []
                        break;
                }
        
                
                
                this.push(Buffer.from((new Float32Array(y).buffer)))
        
                cb();
            }
        })
        this.type = 'fm'
    }

    changeDemodulator(type) {
        this.type = type
    }

}


const demodulate = new Transform({
    transform(chunk, encoding, cb) {
        //Separate IQ components from  the stereo signal
      /*   let iq = [[], []];
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
            const rounded_val = Math.round(y[i]*40) +127.5;
            y_mono.push(rounded_val);
            y_mono.push(rounded_val);
        } 

        out_audio_chunk.set(y_mono); 
        const f_chunk = convert_u8_f(Buffer.from(out_audio_chunk.buffer))
        this.push(Buffer.from(f_chunk.buffer)) */


        let iq = [[], []];
        let f_chunk = convert_u8_f(chunk)

        
        for(let i = 0; i < f_chunk.length; i+=2) {
            iq[0].push(f_chunk[i]);
            iq[1].push(f_chunk[i+1]);
        }

        let y = fmiqdemod.iqdemod(iq);

        this.push(Buffer.from((new Float32Array(y).buffer)))

        cb();
    }
    
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

const dem = spawn('csdr', ['fmdemod_quadri_cf']);
const decimator = spawn('csdr', ['fractional_decimator_ff', '5']);
const f_to_s16 = spawn('csdr', ['convert_f_s16']);

/* read_file_stream.pipe(demodulate).pipe(decimator.stdin)
decimator.stdout.pipe(f_to_s16.stdin)
f_to_s16.stdout.pipe(process.stdout); */




const mySdr = new RtlSdr(0);
//mySdr.start()

//Using demodulatio from csdr
/* mySdr.stream
.pipe(u8_to_f.stdin)
u8_to_f.stdout.pipe(dem.stdin)
dem.stdout.pipe(decimator.stdin)
decimator.stdout.pipe(f_to_s16.stdin)
f_to_s16.stdout.pipe(process.stdout) */

//Using our demodulation
const demodulateStream = new DemodulateStream()
mySdr.stream.pipe(demodulateStream).pipe(decimator.stdin)
//decimator.stdout.pipe(process.stdout)

module.exports = {
    mySdr: mySdr,
    outStream: decimator.stdout,
    demodulateStream,
    MIN_CENTER_FREQ: 26e6,
    MAX_CENTER_FREQ: 1700e6
}

