import pretty from 'pino-pretty';
import { short } from 'leeks.js';
import { format } from 'node:util';

export default function(options: pretty.PrettyOptions) {
	const colours = {
		debug: ['&0&!9', '&9'],
		error: ['&0&!c', '&c'],
		fatal: ['&0&!4', '&0&!4'],
		info: ['&0&!b', '&b'],
		trace: ['&f&!7', '&7'],
		warn: ['&0&!6', '&6'],
	};
	return pretty({
		...options,
		customPrettifiers: {
			// key: (value, _key, _log, { colors }) => String(value),
			caller: caller => short(`&a${caller}`),
			hostname: hostname => short(`&7${hostname}`),
			level: level => short(`&r ${colours[<keyof typeof colours>level][0]} ${level} &r`),
			name: name => short(`&5${name}`),
			pid: pid => short(`&f&!0${pid}`),
			service: name => short(`&d&!0${name}`),
			time: timestamp => short(`&!7&f ${timestamp} &r`),
		},
		messageFormat: (log, msgKey) => log.msg ? short(`${colours[<keyof typeof colours>log.level][1]}${format(log[msgKey])}`) : '',
	});
}