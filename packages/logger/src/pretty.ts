import pretty from 'pino-pretty';
import { short } from 'leeks.js';
import { format } from 'node:util';

function getDurationColour(duration: number) {
	if (duration < 100) return '&a'; // light green = fast
	if (duration < 500) return '&e'; // light yellow = slightly slow
	if (duration < 1000) return '&c'; // light red = slow
	return '&4'; // dark red = very slow
}

function getStatusColour(status: number) {
	switch ((status / 100) | 0) {
	case 5: // red = error
		return '&4';
	case 4: // yellow = warning
		return '&6';
	case 3: // cyan = redirect
		return '&3';
	case 2: // green = success
		return '&2';
	}
	return '&f'; // white = other
}

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
			duration: duration => short(getDurationColour(Number(duration)) + duration),
			hostname: hostname => short(`&7${hostname}`),
			level: level => short(`&r ${colours[<keyof typeof colours>level][0]} ${level} &r`),
			name: name => short(`&5${name}`),
			pid: pid => short(`&f&!0${pid}`),
			service: name => short(`&d&!0 ${name} &r`),
			status: status => short(getStatusColour(Number(status)) + status),
			time: timestamp => short(`&!7&f ${timestamp} &r`),
		},
		messageFormat: (log, msgKey) => log.msg ? short(`${colours[<keyof typeof colours>log.level][1]}${format(log[msgKey])}`) : '',
	});
}