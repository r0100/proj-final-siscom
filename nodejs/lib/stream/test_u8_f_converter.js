const fs = require('fs')
const writeStream = fs.createWriteStream('./test_converter_out');
const readStream = fs.createReadStream('./test');

function convert_u8_f(chunk) {
    let u8Buffer = new Uint8Array(chunk);
    let fArray = [];


    for (let i = 0; i < chunk.length; ++i) {
        fArray.push((u8Buffer[i]/(255/2)) - 1);

    }
    return new Float32Array(fArray);
}


readStream.on('data', (chk) => {
    const converted = convert_u8_f(chk)
    console.log(Buffer.from(converted.buffer))
    writeStream.write(Buffer.from(converted.buffer));
})