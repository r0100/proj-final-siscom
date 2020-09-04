const fm = require("./fmiqdemod.js");
const am = require("./amiqdemod.js");
const usb = require("./usbiqdemod.js");
const lsb = require("./lsbiqdemod.js");
const aux = require("../auxiliary.js");

const {Transform} = require('stream');


class DemodulateStream extends Transform {

    constructor() {
        super({
            transform(chunk, encoding, cb) {
                let iq = [[], []];
                let f_chunk = new Float32Array(chunk.buffer)
        
                
                for(let i = 0; i < f_chunk.length; i+=2) {
                    iq[0].push(f_chunk[i]);
                    iq[1].push(f_chunk[i+1]);
                }
        
                let y;
        
                switch (this.type) {
                    case 'fm':
                        y = fm.iqdemod(iq);
                        break;
                
                    case 'am':
                        y = am.iqdemod(iq);
                        break;
                    default:
                        y = []
                        break;
                }

                if (this.filter) {
                    y = aux.filterff(y);
                }
                
                this.push(Buffer.from((new Float32Array(y).buffer)))
        
                cb();
            }
        })
        this.type = 'nenhum';
        this.filter = true;
    }

    changeDemodulator(type) {
        this.type = type
    }

    changeFilter(state) {
        this.filter = state;
    }

}

module.exports = {
	demodulateff: new DemodulateStream()
}
