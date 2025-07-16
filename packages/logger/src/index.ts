import pino from 'pino';
import caller from 'pino-caller';
import { dirname } from 'node:path';

export async function createLogger() {
	const options: pino.LoggerOptions = {
		base: { pid: process.pid },
		formatters: {
			level: label => ({ level: label }),
		// log: obj => obj, // ? can reshape
		},
		hooks: { /* streamWrite: s => s, // ? can be used for pattern redaction */ },
		level: 'trace', // ? start at the highest
		// redact: [], // ? path redaction
	};

	const prettify = pino.transport({
		targets: [
			{
				options: {
					ignore: 'caller,pid,hostname',
					sync: false,
				},
				target: await Bun.resolve('./pretty', import.meta.dir),
			},
		],
	});


	const logWithoutCaller = pino(options, process.env.DISABLE_PRETTY_PRINT !== 'true' && prettify);
	const log = caller(
		logWithoutCaller,
		{ relativeTo: dirname(Bun.main) },
	);

	return {
		log,
		logWithoutCaller,
	};
}

export type Logger = pino.Logger;