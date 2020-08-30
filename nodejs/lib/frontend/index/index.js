const aump = require('./audio-manip.js');
const info = require('./interface-update.js');

document.addEventListener('DOMContentLoaded', () => {
	//código relacionado com a parte do painel no topo da página
	info.initInfo();

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
				case 'frq':
				case 'bndeq':
				case 'bnddr':
					if(event.type==='change' && info.usr_cfg.onoff==='on') info.sendBandServer();
					aump.updateFrq(info.usr_cfg.frq, info.usr_cfg.bndeq, info.usr_cfg.bnddr);
					break;
				case 'dmd':
					aump.updateDemod(event.target.value);
					break;
				case 'flt':
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
