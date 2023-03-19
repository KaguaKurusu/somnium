const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ipc', {
	getValue: (callback) => {
		ipcRenderer.on('get_value', callback);
	},
	getBounds: (callback) => {
		ipcRenderer.on('bounds', callback);
	},
	setWin: (obj) => {
		ipcRenderer.send('set_window', obj);
	},
	closeWin: () => {
		ipcRenderer.send('close_window');
	},
	history: (type) => {
		ipcRenderer.send('history', type);
	}
});