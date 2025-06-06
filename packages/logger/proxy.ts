import type { Logger } from 'leekslazylogger';
import type {
	LogLevel, LogLevelType,
} from 'leekslazylogger/types/types';

type ProxiedLog = {
	content: unknown[];
	level: string;
	namespace: string | null;
}

const sym = Symbol('LogProp');

function forward(...mixedArgs: unknown[]): void {
	const idx = mixedArgs.findIndex(arg => !(arg instanceof Object && Object.hasOwn(arg, sym)));
	const props = mixedArgs.slice(0, idx).map(arg => (<{ [sym]: string }>arg)[sym]);
	const args = mixedArgs.slice(idx);
	const log: ProxiedLog = {
		content: args,
		level: props[0] || 'info',
		namespace: props[1] ?? null,
	};
	process.send?.({ log });
}

const handler = {
	get(target: typeof forward, prop: string) {
		if (typeof prop === 'string') {
			return new Proxy(target.bind(null, { [sym]: prop }), handler);
		} else {
			return Reflect.get(target, prop);
		}
	},
};

export const proxyLogger = new Proxy(forward, handler);

export function receiveProxiedLogs(logger: Logger) {
	const levels = logger.levels
		.map(name => <LogLevel>{
			name,
			number: logger.levels.indexOf(name),
			type: (logger.options.levels[name] || 'info') as LogLevelType,
		})
		.reduce((acc, level) => {
			acc[level.name] = level;
			return acc;
		}, {} as Record<string, LogLevel>);
	process.on('message', (message: unknown) => {
		if (message instanceof Object && Object.hasOwn(message, 'log')) {
			const { log: proxied } = message as { log: ProxiedLog };
			const {
				content, level, namespace,
			} = proxied;
			if (!levels[level]) throw new Error(`Unknown log level: ${level}`);
			logger.log(namespace, levels[level], ...content);
		}
	});
}
