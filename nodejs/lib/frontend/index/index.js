const aump = require('./audio-manip.js');
const info = require('./interface-update.js');
const io = require('socket.io-client');

document.addEventListener('DOMContentLoaded', () => {

	var socket = io(); 
	info.initInfo();

	let infoElementIds = ['on-off-sect', 'vol', 'frq', 'bndeq', 'bnddr', 'dmd-sect', 'flt'];
	infoElementIds.forEach((id) => {
		function callUpdate() {
			if(id==='flt')
				event.target.value = (event.target.checked===true)?'on':'off';

			info.usr_cfg[event.target.id] = info.updateInfoText(event.target);			

			switch(event.target.id) {
				case 'onoff':
					aump.playPause(event.target.value, info.usr_cfg, socket);
					break;
				case 'vol':
					aump.updateVolume(event.target.value);
					break;
				case 'frq':
				case 'bndeq':
				case 'bnddr':
				case 'dmd':
					//aump.updateDemod(event.target.value);
				case 'flt':
					//aump.updateFilter(event.target.value);
					if(event.type==='change' && info.usr_cfg.onoff==='on') info.sendInfoServer(socket);
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
