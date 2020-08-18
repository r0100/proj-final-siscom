const {amiqdemod, fmiqdemod, lsbiqdemod, usbiqdemod} = require('../../demodulators');

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

        let y = fmiqdemod.fmiqdemod(iq, audio_filter);
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

