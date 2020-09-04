class Filter extends Transform {
	constructor() {
		super({
			//let output_buffer = [];
			if(this.state==='off') {
				this.push(chunk);
			} else {
				chunk = new Float32Array(chunk.buffer);
				//console.log(chunk);
				let tmp = [];
				let y = [];
				let filter_order = audio_filter.length;

				for(let i = 0; i < chunk.length; i++) {
					tmp.push(chunk[i]);
					if(i > filter_order) {
						y[i] = fir_filter(tmp, audio_filter);
						tmp.shift();
					} else {
						y[i] = tmp[i];
					}
				}

				y = new Float32Array(y);
				//console.log(y);
				this.push(Buffer.from(y.buffer));
			}

			this.push(output_buffer);
			cb();
		})
		this.state = 'on';
	}

	changeState(newState) {
		this.state = newState;
	}
}

module.exports = {
    filter: new Filter();
}