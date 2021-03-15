const { path } = require('./utils/fs');
const config = require('../user/config');
const Logger = require('leekslazylogger-fastify');
module.exports = new Logger({
	name: 'Discord Tickets by eartharoid',
	debug: config.debug,
	logToFile: config.logs.enabled,
	splitFile: true,
	directory: path('./logs/'),
	keepFor: config.logs.keep_for,
	levels: {
		_logger: {
			format: '&7[{timestamp}]&r [LOGGER] {text}'
		},
		basic: {
			format: '[{timestamp}] {text}'
		},
		console: {
			format: '[{timestamp}] [INFO] {text}'
		},
		info: {
			format: '&7[{timestamp}]&r &3[INFO] &b{text}'
		},
		success: {
			format: '&7[{timestamp}]&r &2[SUCCESS] &a{text}'
		},
		debug: {
			format: '&7[{timestamp}]&r &1[DEBUG] &9{text}'
		},
		notice: {
			format: '&7[{timestamp}]&r &0&!6[NOTICE] {text}'
		},
		warn: {
			format: '&7[{timestamp}]&r &6[WARN] &e{text}'
		},
		error: {
			format: '&7[{timestamp}]&r &4[ERROR] &c{text}'
		},
		commands: {
			type: 'info',
			format: '&7[{timestamp}]&r &3[INFO] &d(COMMANDS)&r {text}'
		},
		plugins: {
			type: 'info',
			format: '&7[{timestamp}]&r &3[INFO] &d(PLUGINS)&r {text}'
		},
		tickets: {
			type: 'info',
			format: '&7[{timestamp}]&r &3[INFO] &d(TICKETS)&r {text}'
		},
		http: {
			type: 'info',
			format: '&7[{timestamp}]&r &3[INFO] &d(HTTP)&r {text}'
		},
		ws: {
			type: 'info',
			format: '&7[{timestamp}]&r &3[INFO] &d(WS)&r {text}'
		}
	}
});