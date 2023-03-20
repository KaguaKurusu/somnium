const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const gaze = require('gaze');
const {exec} = require('child_process');
const os = require('os');
const packager = require("electron-packager");

const stylus = require('./lib/stylus');
const pug = require ('./lib/pug');
const js = require('./lib/js');
const config = require('./config/config');
const pkg = require('./package.json');
const command = process.argv[2];

let dirs = {
	src: 'src',
	dist: 'build/Debug',
	release: 'build/Release',
	installer: 'installer'
};

let paths = {
	stylus: `${dirs.src}/stylus/*.styl`,
	pug: `${dirs.src}/pug/*.pug`,
	js: `${dirs.src}/js/*.js`
};

let fn = {
	stylus: stylus2css,
	pug: pug2html,
	js: minifyJS
};

let msg = {
	stylus: "Stylus files were converted to CSS.",
	pug: "Pug files were converted to HTML.",
	js: "JavaScript files were compressed."
};

switch (command) {
	case 'stylus':
	case 'pug':
	case 'js':
		fs.mkdirp(dirs.dist);

		glob(paths[command])
			.then(files => {
				Promise.all(files.map(fn[command].bind(null, config[command])))
			})
			.then(() => console.log(msg[command]))
			.catch(err => console.error(err));
		break;
	case 'package':
		fs.mkdirp(dirs.dist);

		copyPackageJson();
		break;
	case 'icon':
		fs.mkdirp(dirs.dist);

		fs.copy('icon/win/app.ico', `${dirs.dist}/app.ico`)
			.catch(err => console.error(err));
		break;
	case 'release':
		release(process.platform, os.arch());
		break;
	case 'release:all':
		release(process.platform, 'all');
		break;
	case 'make':
		makeInstaller()
			.then(() => console.log('Installer was created.'))
			.catch(err => console.error(err))
		break
	case 'ace':
		installAce();
		break;
	case 'watch':
		startWatch(config.watch);
		break;
	case 'clean':
		rmdir('build');
		rmdir('ace');
		break;
}

function stylus2css(config, file) {
	fs.readFile(file)
		.then(stylus.bind(null, config))
		.then(fs.outputFile.bind(null, distPath('css', file)))
		.catch(err => console.log(err));
}

function pug2html(config, file) {
	pug(config, {
		// variable in Pug
	}, file)
		.then(fs.outputFile.bind(null, distPath('html', file)))
		.catch(err => console.log(err));
}

function minifyJS(config, file) {
	fs.readFile(file)
		.then(js.bind(null, config))
		.then(fs.outputFile.bind(null, distPath('js', file)))
		.catch(err => console.log(err));
}

function copyPackageJson() {
	// Copy package.json
	let keys = ['name', 'productName', 'version', 'main', 'author', 'license','dependencies'];
	let data = {};

	pkg.main = 'main.js';
	keys.forEach(key => {
		data[key] = pkg[key]
	});
	fs.outputJson(path.join(dirs.dist, 'package.json'), data)
		.then(installNodeModules.bind(null, dirs.dist))
		.then(data => console.log(data))
		.catch(err => console.error(err));
}

function installNodeModules(dir) {
	return new Promise((resolve, reject) => {
		exec('npm i', { cwd: dir }, (err, stdout, stderr) => {
			if (err) reject(err)
			else resolve(stdout)
		})
	});
}

function release(platform, arch) {
	let option = {
		name: pkg.name,
		dir: dirs.dist,
		out: dirs.release,
		overwrite: true,
		asar: true,
		appVersion: pkg.version,
		appCopyright: `© 2023 ${pkg.author}.`
	};

	switch (platform) {
		case 'win32':
			option.icon = 'icon/win/app.ico';
			option.platform = platform;
			option.win32metadata = {
				CompanyName: pkg.autor,
				FileDescription: pkg.productName,
				OriginalFilename: `${pkg.name}.exe`,
				ProductName: pkg.productName,
				InternalName: pkg.productName
			};
			break;
		case 'darwin':
			option.icon = 'icon/mac/app.icns';
	}

	switch (arch) {
		case 'x64':
		case 'ia32':
		case 'arm64':
		case 'all':
			option.arch = arch;
			break;
		default:
			option.arch = 'all';
	}

	packager(option)
		.then(data => console.log(data))
		.catch(err => console.error(err));
}

function makeInstaller() {
	return new Promise((resolve, reject) => {
		switch (process.platform) {
			case 'win32':
				exec('Compil32.exe /cc installer\\Setup.iss', (err, stdout, stderr) => {
					if (err) reject(err)
					else resolve(stdout)
				})
				break
			case 'darwin':
				reject(new Error('インストーラは不要です'))
				break
			default:
				reject(new Error("インストーラ作成方法ないよ"))
		}
	})
}

function startWatch() {
	gaze(path.join(dirs.src, '/**/*.stylus'), (err, watcher) => {
		if (err) console.error(err);
		watcher.on('all', (ev, file) => {
			stylus2css(config.stylus, file);
		});
	});

	gaze(path.join(dirs.src, '/**/*.pug'), (err, watcher) => {
		if (err) console.error(err);
		watcher.on('all', (ev, file) => {
			pug2html(config.pug, file);
		});
	});

	gaze(path.join(dirs.src, '/**/*.js'), (err, watcher) => {
		if (err) console.error(err);
		watcher.on('all', (ev, file) => {
			minifyJS(config.js, file);
		});
	});

	gaze('package.json', (err, watcher) => {
		if (err) console.error(err);
		watcher.on('all', () => { copyPackageJson(); });
	});
}

function distPath(ext, file) {
	let parse = path.parse(file);

	return path.join(
		dirs.dist,
		`${parse.name}.${ext}`
	);
}

function rmdir(dir) {
	fs.remove(dir, err => {
		if (err) console.log(err);
	});
}

function installAce() {
	cloneAce()
		.then(installNodeModules.bind(null, 'ace'))
		.then(buildAce.bind(null))
		.then(() => {
			fs.rename('build\\Debug\\ace\\src-min', 'build\\Debug\\ace\\src');
			fs.copy('ace\\LICENSE', 'build\\Debug\\ace\\LICENSE');
		})
		.catch(err => console.error(err));
}

function cloneAce() {
	return new Promise((resolve, reject) => {
		exec('git clone https://github.com/ajaxorg/ace.git', (err, stdout, stderr) => {
			if (err) reject(err);
			else resolve(stdout);
		});
	});
}

function buildAce() {
	return new Promise((resolve, reject) => {
		exec('node .\\Makefile.dryice.js -m --target ..\\build\\Debug\\ace', { cwd: 'ace' }, (err, stdout, stderr) => {
			if (err) reject(err);
			else resolve(stdout);
		});
	});
}