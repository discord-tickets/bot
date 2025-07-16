import {
	createLogger,
	type Logger,
} from '@discord-tickets/logger';
import {
	Config,
	schema,
	template,
} from '@discord-tickets/config';
import { Service } from './class/service';

let _config: Config<typeof schema>;
let _log: Logger;
let _logWithoutCaller: Logger;
let _service: Service;

if (Bun.isMainThread) {
	const logger = await createLogger();
	_log = logger.log;
	_logWithoutCaller = logger.logWithoutCaller;

	// pino-caller crashes when used here
	process.on('uncaughtException', (error, origin) => _logWithoutCaller.fatal(error, origin));

	_service = new Service(_log);

	const path = './data/config.toml';

	if (!await Bun.file(path).exists()) {
		_log.info('Copying default config file to "%s"', path);
		await Bun.write(path, Bun.file(template));
	}

	_config = new Config<typeof schema>(_service.logWithName('config'), path, schema);

	_config.watch(['log_level'], level => {
		_log.trace('log_level=%s', level);
		_log.level = level;
		_service.loggers.forEach((child, name) => {
			_log.trace('updating level of log child %s', name);
			child.level = level;
		});
	});

	await _config.load();
} else {
	// TODO: proxies
	throw new Error('not implemented');
}

export const config = _config;
export const log = _log;
export const logWithoutCaller = _logWithoutCaller;
export const service = _service;