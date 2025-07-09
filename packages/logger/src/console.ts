import type { Log } from 'leekslazylogger/types/types';
import { ConsoleTransport } from 'leekslazylogger';
import { short } from 'leeks.js';
import config from '@discord-tickets/config';

await config.load(['global']);

const colours = {
	critical: ['&0&!4', '&5', '&0&!c'],
	debug: ['&0&!1', '&5', '&9'], // ! `debug` pkg should be used by other pkgs
	error: ['&0&!4', '&5', '&c'],
	fatal: ['&0&!4', '&5', '&0&!c'],
	info: ['&0&!3', '&5', '&b'],
	notice: ['&0&!6', '&5', '&0&!e'],
	success: ['&0&!2', '&5', '&a'],
	verbose: ['&0&!f', '&5', '&r'],
	warn: ['&0&!6', '&5', '&e'],
};

export function formatter(log: Log): string {
	const colour = colours[log.level.name as keyof typeof colours];
	const timestamp = new Date().toISOString();
	return short(`&!7&f ${timestamp} &r ${colour[0]} ${log.level.name} &r ${log.namespace ? `${colour[1]}(${log.namespace})&r ` : ''}${colour[2] + log.content}`);
}

export const transport = new ConsoleTransport({
	format: formatter,
	level: config.get('global/log_level'),
});
