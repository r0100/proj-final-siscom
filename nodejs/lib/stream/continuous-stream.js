const {Transform} = require('stream');
const fs = require('fs');

const EventEmitter = require('events');



class StreamLoopEmitter extends EventEmitter {
    constructor() {
        super();
        this.readStream = null;

        this.middleStream = new Transform({
            transform(chunk, encoding, cb) {
                this.push(chunk);
                cb();
            }
        })
    }

    start() {
        this.emit('start');
    }
}

const streamLoopEmitter = new StreamLoopEmitter();

streamLoopEmitter.on('start', () => {
    streamLoopEmitter.readStream = fs.createReadStream('./public/audios/audio.wav');
    //streamLoopEmitter.readStream.pipe(middleStream);
    streamLoopEmitter.readStream.on('data', (chunk)=>process.send(chunk))
    streamLoopEmitter.readStream.on('end', () => {
        streamLoopEmitter.emit('start')
    })
})



//streamLoopEmitter.middleStream.on('data', console.log)
streamLoopEmitter.start();

