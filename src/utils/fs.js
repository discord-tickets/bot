const { join } = require('path');

module.exports = {
	path: path => join(__dirname, '../../', path),
};