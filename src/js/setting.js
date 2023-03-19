const setting = document.getElementById('setting');
const url = document.getElementById('url');
const width = document.getElementById('width');
const height = document.getElementById('height');
const x = document.getElementById('x');
const y = document.getElementById('y');
const minimizable = document.getElementById('minimizable');
const resizable = document.getElementById('resizable');
const movable = document.getElementById('movable');
const get_chat_url_btn = document.getElementById('get_chat_url_btn');
const close_btn = document.getElementById('close');

var editor = ace.edit("css_editor", {
	minLines: 1,
	maxLines: 30,
	autoScrollEditorIntoView: true,
	wrap: true,
	mode: 'ace/mode/css',
	enableLiveAutocompletion: true,
	customScrollbar: true,
	theme: 'ace/theme/ambiance'
});

ipc.getValue((event, value) => {
	url.value = value.url;
	width.value = value.browserWin.width;
	height.value = value.browserWin.height;

	if (value.browserWin.x !== undefined) {
		x.value = value.browserWin.x;
	}

	if (value.browserWin.y !== undefined) {
		y.value = value.browserWin.y;
	}

	editor.setValue(value.css, -1);

	minimizable.checked = value.minimizable;
	resizable.checked = value.resizable;
	movable.checked = value.movable;
});

ipc.getBounds((event, bounds) => {
	width.value = bounds.width;
	height.value = bounds.height;
	x.value = bounds.x;
	y.value = bounds.y;
});

setting.addEventListener('submit', (event) => {
	event.preventDefault();

	const obj = {
		url: url.value,
		width: Number(width.value),
		height: Number(height.value),
		x: Number(x.value),
		y: Number(y.value),
		css: editor.getValue(),
		minimizable: minimizable.checked,
		resizable: resizable.checked,
		movable: movable.checked,
		isOpen: false
	};

	if (event.submitter.id === "open") {
		obj.isOpen = true;
	}

	ipc.setWin(obj);
});

get_chat_url_btn.addEventListener('click', (event) => {
	const stream_url = document.getElementById('yt_stream_url');
	const addr = new URL(stream_url.value);

	let video_id = '';

	if (addr.host === "studio.youtube.com") {
		if (addr.pathname.match(/^\/video\/.+\/livestreaming/)) {
			let end_idx = addr.pathname.search(/\/livestreaming/);

			video_id = addr.pathname.substring(7, end_idx);
		}
	}
	else if (addr.host === "www.youtube.com") {
		if (addr.pathname.match(/\/live\/.+/)) {
			video_id = addr.pathname.substring(6);
		}
		else if (addr.pathname === "/watch" && addr.searchParams.has('v')) {
			video_id = addr.searchParams.get('v');
		}
	}

	if (video_id !== '') {
		url.value = 'https://www.youtube.com/live_chat?v=' + video_id;
	}
});

close_btn.addEventListener('click', (event) => {
	ipc.closeWin();
});
