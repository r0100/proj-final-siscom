(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

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


},{}]},{},[1]);
