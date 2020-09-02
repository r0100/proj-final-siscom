const  Write  = require('web-audio-stream/write')
const io = require('socket.io-client');


const playButton = document.querySelector('.play-button');
const stopButton = document.querySelector('.stop-button');
const amButton = document.querySelector('.am-demod');
const fmButton = document.querySelector('.fm-demod');

const setCenterFreqVal = document.querySelector('.center-freq-val');
const setCenterFreqButton = document.querySelector('.set-center-freq')

let audioCtx = new AudioContext();
audioCtx.sampleRate = 48000;
let myArrayBuffer;
let outAudioStream;
let socket;
let running = false;



function start() {
    socket = io();
    running = true;
    socket.on('raw_audio', (data) => {
        console.log(data)

        //Is necessary create the audio stream only when using it
        // because it keeps raising incorrect input error
        if (!outAudioStream) {
            outAudioStream = Write(audioCtx.destination, {
                channels: 1
            });
        }

        //Filter wrong buffers
        if (data.byteLength % 2 !== 0)
            return;
        
        let fBuff = new Float32Array(data)
        myArrayBuffer = audioCtx.createBuffer(1, fBuff.length, 48000);
        myArrayBuffer.copyToChannel(fBuff, 0);
        outAudioStream(myArrayBuffer)
    })

    socket.on('error', (reason) => {
        console.log(reason);
        stop()
    })
    
    socket.on('connect_error', (reason) => {
        console.log(reason);
        stop()
    })

    socket.on('disconnect', (reason) => {
        console.log(reason);
        stop();

    })
}

function stop() {
    if (socket)
        socket.close();

    socket = null;

    if (outAudioStream)
        outAudioStream(null);

    outAudioStream = null;
    running = false;
}

function cleanAudioCache() {
    if (outAudioStream) {
        outAudioStream(null);
        outAudioStream = Write(audioCtx.destination, {
            channels: 1
        });
    }
}

// wire up play button
playButton.onclick = function() {
    if (!running)
        start();
}

stopButton.onclick = function () {
    stop();
}

amButton.onclick = function () {
    if (socket) { 
        socket.emit('set_config', {demodulation: 'am'})
        cleanAudioCache()
    }
}

fmButton.onclick = function () {
    if (socket) {
        socket.emit('set_config', {demodulation: 'fm'})
        cleanAudioCache()

    }
    
}

setCenterFreqButton.onclick = function () {
    if (socket) {
        socket.emit('set_config', {center_freq: setCenterFreqVal.valueAsNumber})
        cleanAudioCache()
    }
}