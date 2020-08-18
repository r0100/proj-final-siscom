const aump = require('./audio-manip.js');
const info = require('./interface-update.js');
const { fir_filter } = require('../../auxiliary')
const {amiqdemod, fmiqdemod, lsbiqdemod, usbiqdemod} = require('../../demodulators');

document.addEventListener('DOMContentLoaded', () => {
	//código relacionado com a parte do painel no topo da página
	info.initInfo();
	aump.initAudio();

	let infoElementIds = ['on-off-sect', 'vol', 'frq', 'bndeq', 'bnddr', 'dmd-sect', 'flt'];
	infoElementIds.forEach((id) => {
		function callUpdate() {
			if(id==='flt')
				event.target.value = (event.target.checked===true)?'on':'off';

			info.usr_cfg[event.target.id] = info.updateInfoText(event.target);			

			switch(event.target.id) {
				case 'onoff':
					aump.playPause(event.target.value, info.usr_cfg.vol);
					break;
				case 'vol':
					aump.updateVolume(event.target.value);
					break;
				case 'dmd':
					aump.updateDemod(event.target.value);
					break;
				case 'filt':
					aump.updateFilter(event.target.value);
					break;
			}
		}

		switch(id) {
			case 'vol':
			case 'frq':
			case 'bndeq':
			case 'bnddr':
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
