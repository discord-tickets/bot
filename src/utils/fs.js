const { join } = require('path');

module.exports = {
	/**
	 * Make a relative path absolute
	 * @param {string} path - A path relative to the root of the project (like "./user/config.js")
	 * @returns {string} absolute path
	 */
	path: path => join(__dirname, '../../', path),
};