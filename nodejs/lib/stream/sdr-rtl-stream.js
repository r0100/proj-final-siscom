const rtlsdr = require('rtl-sdr')
const {Readable} = require('stream');



module.exports = class RtlSdr {
    constructor(deviceIndex) {
        this.dev = rtlsdr.open(deviceIndex);
        if (typeof this.dev === 'number') {
            console.log('Error opening the RTL-SDR device: %s', this.dev);
            process.exit(1);
        }

        //Set gain to max
        //rtlsdr.set_tuner_gain_mode(this.dev, 190);
        // Set the frequency correction value for the device
        //rtlsdr.set_freq_correction(this.dev, 0)
        // Enable or disable the internal digital AGC of the RTL2822
        //rtlsdr.set_agc_mode(this.dev, 1)
        // Select sample rate
        rtlsdr.set_sample_rate(this.dev, 240000)
        // Reset the internal buffer
        rtlsdr.reset_buffer(this.dev)

        rtlsdr.set_center_freq(this.dev, 93.5e6);


        this.stream = new Readable({
            read: () => {}
        })
    }

    start() {
        rtlsdr.read_async(
            this.dev, 
            (data, _) => this.stream.push(data),
            () => {this.stream.push(null)}, 
            0, 
            0
        )
    }

    stop() {
        rtlsdr.cancel_async(this.dev);
    }
    
    setCenterFreq(freq) {
        rtlsdr.set_center_freq(this.dev, freq);
    }
}
