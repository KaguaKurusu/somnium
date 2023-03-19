const { app, BrowserWindow, Menu, Tray, ipcMain,  dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { dir } = require('console');
const { title } = require('process');
const os = require('node:os');

const store = new Store();

const settingWinMinSize = {
	width: 340,
	height: 770
}

let conf = {};
let tray = null;
let browserWin = {
	win: null,
	contents: null
};
let settingWin = null;
let loginWin = null;

// 多重起動防止
const gotTheLock = app.requestSingleInstanceLock()
if ( !gotTheLock ) {
	app.quit();
}

app.enableSandbox();

const createTray = () => {
	tray = new Tray(path.join(__dirname, 'app.ico'));
	const menu = Menu.buildFromTemplate([
		{
			label: 'ブラウザウィンドウ',
			submenu: [
				{ label: '開く', click: () => { openBrowserWindow(); } },
				{ label: '閉じる', click: () => { closeBrowserWindow(); }}
			]
		},
		{ type: 'separator' },
		{ label: 'YouTubeログイン', click: () => { openLoginWindow(); } },
		{ type: 'separator' },
		{ label: '設定画面を表示する', click: () => {
			if (settingWin === null) {
				createSettingWindow();
			}
			else {
				settingWin.focus();
			}
		} },
		{ type: 'separator' },
		{ label: 'バージョン情報', click: () => {
			showVersionInfo();
		}},
		{ type: 'separator' },
		{ label: '終了', role: 'quit'}
	]);
	tray.setToolTip(app.getName());
	tray.setContextMenu(menu);
};

const initConf = () => {
	conf = {
		browserWin: {
			width: store.get('browserWin.width', 800),
			height: store.get('browserWin.height', 600),
			x: store.get('browserWin.x', 0),
			y: store.get('browserWin.y', 0)
		},
		settingWin: {
			width: store.get('settingWin.width', settingWinMinSize.width),
			height: store.get('settingWin.height', settingWinMinSize.height),
			x: store.get('settingWin.x'),
			y: store.get('settingWin.y')
		},
		url: store.get('url', ''),
		css: store.get('css', 'body{-webkit-app-region:drag;}'),
		minimizable: store.get('minimizable', true),
		resizable: store.get('resizable', true),
		movable: store.get('movable', true)
	};
};

const createBrowserWindow = () => {
	browserWin.win = new BrowserWindow({
		show: false,
		width: conf.browserWin.width,
		height: conf.browserWin.height,
		x: conf.browserWin.x,
		y: conf.browserWin.y,
		minimizable: conf.minimizable,
		resizable: conf.resizable,
		movable: conf.movable,
		maximizable: false,
		fullscreenable: false,
		webPreferences: {
			devTools: false,
		},
		frame: false,
		transparent: true
	});

	browserWin.win.loadURL(conf.url);
	browserWin.win.once('ready-to-show', () => {
		browserWin.win.show();
	});
	browserWin.win.once('closed', () => {
		browserWin = {
			win: null,
			contents: null
		};
	});

	browserWin.win.on('moved', () => {
		conf.browserWin = browserWin.win.getBounds();
		sendBrowserWinBounds();
		saveConf();
	});

	browserWin.win.on('resized', () => {
		conf.browserWin = browserWin.win.getBounds();
		sendBrowserWinBounds();
		saveConf();
	});

	browserWin.contents = browserWin.win.webContents;
	browserWin.contents.on('did-finish-load', () => {
		browserWin.contents.insertCSS(conf.css);
	});
};

const createSettingWindow = () => {
	settingWin = new BrowserWindow({
		show: false,
		width: conf.settingWin.width,
		height: conf.settingWin.height,
		minWidth: settingWinMinSize.width+14,
		minHeight: settingWinMinSize.height+27,
		x: conf.settingWin.x,
		y: conf.settingWin.y,
		webPreferences: {
			devTools: false,
			preload: path.join(__dirname, 'preload.js'),
		},
	});

	settingWin.loadFile(path.join(__dirname, 'setting.html'));
	settingWin.once('ready-to-show', () => {
		settingWin.show();
		settingWin.webContents.send('get_value', conf);
	});
	settingWin.once('closed', () => {
		settingWin = null;
	});

	settingWin.on('moved', () => {
		conf.settingWin = settingWin.getBounds();
		saveConf();
	});

	settingWin.on('resized', () => {
		conf.settingWin = settingWin.getBounds();
		saveConf();
	});
};

const createLoginWin = () => {
	loginWin = new BrowserWindow({
		show: false,
		width: 600,
		height: 580,
		resizable: false,
		maximizable: false,
		fullscreenable: false,
		webPreferences: {
			devTools: false,
		},
	});

	loginWin.setMenu(null);
	loginWin.loadURL('https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Ddesktop%26hl%3Dja%26next%3Dhttps%253A%252F%252Fwww.youtube.com%252F&hl=ja&ec=65620');
	loginWin.once('ready-to-show', () => {
		loginWin.show();
	});
	loginWin.once('closed', () => {
		loginWin = null;
	});
};

const createAppMenu = () => {
	const template = [
		{
			label: 'ファイル(&F)',
			submenu: [
				{ label: 'ウィンドウを閉じる', role: 'close' },
				{ label: '終了', role: 'quit', accelerator: 'Alt + F4' }
			]
		},
		{
			label: '編集(&E)',
			submenu: [
				{ label: '元に戻す', role: 'undo' },
				{ label: 'やり直し', role: 'redo' },
				{ type: 'separator' },
				{ label: '切り取り', role: 'cut' },
				{ label: 'コピー', role: 'copy' },
				{ label: '貼り付け', role: 'paste' },
				{ label: '削除', role: 'delete' },
				{ type: 'separator' },
				{ label: 'すべて選択', role: 'selectAll' }
			]
		},
		{
			label: 'ウィンドウ(&W)',
			submenu: [
				{
					label: 'ブラウザウィンドウ',
					submenu: [
						{ label: '開く', click: () => { openBrowserWindow(); } },
						{ label: '閉じる', click: () => { closeBrowserWindow(); }}
					]
				},
				{ type: 'separator' },
				{ label: 'YouTubeログイン', click: () => { openLoginWindow() } }
			]
		},
		{
			label: 'ヘルプ(&H)',
			submenu: [
				{ label: 'バージョン情報', click: () => { showVersionInfo(); } }
			]
		}
	];

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
};

const setIpcs = () => {
	ipcMain.on('set_window', (event, obj) => {
		conf.url = obj.url;
		conf.browserWin.width = obj.width;
		conf.browserWin.height = obj.height;
		conf.browserWin.x = obj.x;
		conf.browserWin.y = obj.y;
		conf.css = obj.css;
		conf.minimizable = obj.minimizable;
		conf.resizable = obj.resizable;
		conf.movable = obj.movable;

		if (browserWin.win !== null) {
			browserWin.win.setBounds({
				width: conf.browserWin.width,
				height: conf.browserWin.height,
				x: conf.browserWin.x,
				y: conf.browserWin.y
			});

			browserWin.win.minimizable = conf.minimizable;
			browserWin.win.resizable = conf.resizable;
			browserWin.win.movable = conf.movable;

			browserWin.win.loadURL(conf.url);
			browserWin.contents = browserWin.win.webContents;
			browserWin.contents.on('did-finish-load', () => {
				browserWin.css_key = browserWin.contents.insertCSS(conf.css);
			});
		}

		if (obj.isOpen === true) {
			openBrowserWindow();
		}

		saveConf();
	});

	ipcMain.on('close_window', (event) => { closeBrowserWindow(); })
};

const openBrowserWindow = () => {
	if (browserWin.win === null && conf.url !== '') {
		createBrowserWindow();
	}
	else if(browserWin.win !== null) {
		browserWin.win.focus();
	}
};

const closeBrowserWindow = () => {
	if (browserWin.win !== null) {
		browserWin.win.close();
	}
};

const openLoginWindow = () => {
	if (loginWin === null) {
		createLoginWin();
	}
	else {
		loginWin.focus();
	}
};

const sendBrowserWinBounds = () => {
	if (settingWin !== null) {
		settingWin.webContents.send('bounds', conf.browserWin);
	}
};

const showVersionInfo = () => {
	const msg =
		'Version : '   + app.getVersion() + '\n' +
		'Node.js : '   + process.versions.node + '\n' +
		'Chromium : '  + process.versions.chrome + '\n' +
		'Electron : '  + process.versions.electron + '\n' +
		'V8 : '        + process.versions.v8 + '\n' +
		'OS : '        + os.type() + ' ' + os.arch() + ' ' + os.release();

	dialog.showMessageBox({
		type: 'info',
		message: msg,
		title: app.getName(),
	});
};

const saveConf = () => {
	conf = Object.fromEntries(Object.entries(conf).filter(([, v]) => v !== undefined));
	store.set(conf);
};

app.whenReady().then(() => {
	initConf();
	createAppMenu();
	createTray();
	setIpcs();

	if (settingWin === null) {
		createSettingWindow();
	}
});

app.on('window-all-closed', () => {
	// なんもすることないけど、ないとウィンドウ全部閉じたときにアプリ終了しちゃうから必要。
});

app.on('will-quit', () => {
	saveConf();
});
