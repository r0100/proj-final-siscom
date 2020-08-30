
const playButton = document.querySelector('button');

// Create AudioContext and buffer source
let audioCtx;
let myArrayBuffer;
let source;


function init() {
    audioCtx = new AudioContext();


    function getData() {
        request = new XMLHttpRequest();
        request.open('GET', '/audio', true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            let audioData = request.response;
            let fBuff = new Float32Array(audioData)
            myArrayBuffer = audioCtx.createBuffer(1, audioData.byteLength, 48000);
            let nowBuffering = myArrayBuffer.getChannelData(0);
            for (let i = 0; i < audioData.byteLength; ++i) {
                nowBuffering[i] = fBuff[i];
            }

            source = audioCtx.createBufferSource();

            source.buffer = myArrayBuffer;
            // connect the AudioBufferSourceNode to the
            // destination so we can hear the sound
            source.connect(audioCtx.destination);
            // start the source playing
            source.start();
        }

        request.send();
    }



    getData();

    // set the buffer in the AudioBufferSourceNode

    

}

// wire up play button
playButton.onclick = function() {
    if(!audioCtx) {
        init();
    }
}

