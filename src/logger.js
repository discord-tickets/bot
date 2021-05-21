const { path } = require('./utils/fs');
const config = require('../user/config');
const Logger = require('leekslazylogger-fastify');
module.exports = new Logger({
	debug: config.debug,
	directory: path('./logs/'),
	keepFor: config.logs.keep_for,
	levels: {
		_logger: { format: '&f&!7{timestamp}&r [LOGGER] {text}' },
		basic: { format: '&f&!7{timestamp} {text}' },
		commands: {
			format: '&f&!7{timestamp}&r &3[INFO] &d(COMMANDS)&r {text}',
			type: 'info'
		},
		console: { format: '&f&!7{timestamp} [INFO] {text}' },
		debug: { format: '&f&!7{timestamp}&r &1[DEBUG] &9{text}' },
		error: { format: '&f&!7{timestamp}&r &4[ERROR] &c{text}' },
		http: {
			format: '&f&!7{timestamp}&r &3[INFO] &d(HTTP)&r {text}',
			type: 'info'
		},
		info: { format: '&f&!7{timestamp}&r &3[INFO] &b{text}' },
		notice: { format: '&f&!7{timestamp}&r &0&!6[NOTICE] {text}' },
		plugins: {
			format: '&f&!7{timestamp}&r &3[INFO] &d(PLUGINS)&r {text}',
			type: 'info'
		},
		success: { format: '&f&!7{timestamp}&r &2[SUCCESS] &a{text}' },
		warn: { format: '&f&!7{timestamp}&r &6[WARN] &e{text}' },
		ws: {
			format: '&f&!7{timestamp}&r &3[INFO] &d(WS)&r {text}',
			type: 'info'
		}
	},
	logToFile: config.logs.enabled,
	name: 'Discord Tickets by eartharoid',
	splitFile: config.logs.split,
	timestamp: 'YYYY-MM-DD HH:mm:ss'
});