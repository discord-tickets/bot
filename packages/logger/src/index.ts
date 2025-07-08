import type {
	LogFunction,
	LoggerOptions,
} from 'leekslazylogger/types/types';

import { Logger } from 'leekslazylogger';

import * as console from './console';
import * as http from './http';
import * as proxy from './proxy';
import createScopedLogger from './scoped';

export interface CustomLogger extends Logger {
	fatal: LogFunction
}

export default function createLogger(options: Partial<LoggerOptions>): CustomLogger {
	return new Logger({
		...options,
		levels: {
			debug: 'info',
			verbose: 'info',
			// eslint-disable-next-line sort-keys
			info: 'info',
			success: 'info',
			warn: 'warn',
			// eslint-disable-next-line sort-keys
			notice: 'warn',
			// eslint-disable-next-line sort-keys
			error: 'error',
			// eslint-disable-next-line sort-keys
			critical: 'error',
			fatal: 'error',
		},
		transports: [console.transport],
	}) as CustomLogger;
}

export {
	console,
	http,
	proxy,
	createScopedLogger,
};