const aump = require('./audio-manip.js');
const info = require('./interface-update.js');

const MAX_FRQ = 1700;
const MIN_FRQ = 0.5;

document.addEventListener('DOMContentLoaded', () => {

	info.initInfo();

	let infoElementIds = ['on-off-sect', 'vol', 'frq', 'frqtext', 'dmd-sect', 'flt'];

	infoElementIds.forEach((id) => {

		function callUpdate() {
			
			let event_id = event.target.id;

			if(event.target.id==='flt')
				event.target.value = (event.target.checked===true)?'on':'off';
			if(event.target.id ==='frq') 
				getById('frqtext').value = event.target.value;
			if(event.target.id === 'frqtext') {
				event_id = 'frq';
				getById('frq').value = event.target.value;
			}

			if(event_id === 'frq') {
				let frq_value = Number(event.target.value);
				if(frq_value > MAX_FRQ) event.target.value = MAX_FRQ;
				if(frq_value < MIN_FRQ) event.target.value = MIN_FRQ;
			}

			info.usr_cfg[event_id] = info.updateInfoText(event.target);			

			switch(event_id) {
				case 'onoff':
					aump.playPause(event.target.value, info.usr_cfg);
					break;
				case 'vol':
					aump.updateVolume(event.target.value);
					break;
				case 'frq':
				case 'bndeq':
				case 'bnddr':
				case 'dmd':
				case 'flt':
					if(event.type==='change' && info.usr_cfg.onoff==='on') aump.sendInfoServer(info.usr_cfg);
					break;
			}
		}

		switch(id) {
			case 'frqtext':
				getById(id).onkeydown = callUpdate;
				getById(id).onkeyup = callUpdate;
				getById(id).onkeypress = callUpdate;
			case 'frq':
			case 'bndeq':
			case 'bnddr':
			case 'vol':
				getById(id).onmousemove = callUpdate;
			case 'on-off-sect':
			case 'dmd-sect':
			case 'flt':
				getById(id).onchange = callUpdate;
			default:
				break;
		}
	});
});

function getById(id) {
	return document.getElementById(id);
}
