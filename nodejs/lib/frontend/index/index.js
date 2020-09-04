const aump = require('./audio-manip.js');
const info = require('./interface-update.js');

document.addEventListener('DOMContentLoaded', () => {

	info.initInfo();

	let infoElementIds = ['on-off-sect', 'vol', 'frq', 'dmd-sect', 'flt'];

	infoElementIds.forEach((id) => {
		function callUpdate() {
			if(event.target.id==='flt')
				event.target.value = (event.target.checked===true)?'on':'off';

			info.usr_cfg[event.target.id] = info.updateInfoText(event.target);			

			switch(event.target.id) {
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
			case 'frq':
			case 'bndeq':
			case 'bnddr':
			case 'vol':
				getById(id).onmousemove = callUpdate;
			case 'on-off-sect':
			case 'dmd-sect':
			case 'flt':
				getById(id).onchange = callUpdate;
		}
	});
});

function getById(id) {
	return document.getElementById(id);
}
