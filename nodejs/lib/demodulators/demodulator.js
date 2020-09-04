const fm = require("./fmiqdemod.js");
const am = require("./amiqdemod.js");
const usb = require("./usbiqdemod.js");
const lsb = require("./lsbiqdemod.js");
const no = require("./noiqdemod.js");

class DemodulateStream extends Transform {

    constructor() {
        super({
                let f_chunk = new Float32Array(chunk.buffer)
        
                
                for(let i = 0; i < f_chunk.length; i+=2) {
                    iq[0].push(f_chunk[i]);
                    iq[1].push(f_chunk[i+1]);
                }
        
                let y;
        
                switch (this.type) {
                    case 'fm':
                        y = fm.demod(iq);
                        break;
                
                    case 'am':
                        y = am.demod(iq);
                        break;
                    case 'lsb:
                        y = lsb.demod(iq);
                        break;
                    case 'usb':
                        y = usb.demod(iq);
                        break;
                    default:
                        y = no.demod(iq);
                        break;
                }
                
                this.push(Buffer.from((new Float32Array(y).buffer)))
        
                cb();
            }
        })
        this.type = 'nenhum'
    }

    changeDemodulator(type) {
        this.type = type
    }

}

module.exports = {
	demdulateff: new DemodulateStream()
}
