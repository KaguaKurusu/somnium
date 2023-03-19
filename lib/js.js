const uglify = require('uglify-js')

module.exports = function minifyJS(option, buffer) {
	return new Promise((resolve, reject) => {
		let result = uglify.minify(buffer.toString(), option)
		if (result.error) reject(result.error)
		else resolve(result.code)
	})
}
