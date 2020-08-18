const {fork} = require('child_process');

const forked = fork('continuous-stream.js');

//forked.on('message', (message) => console.log(message));
