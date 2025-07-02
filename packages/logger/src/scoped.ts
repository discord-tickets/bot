import type { Logger } from 'leekslazylogger';
import type {
	LogLevel,
	LogLevelType,
} from 'leekslazylogger/types/types';

/**
 * Apply a namespace to all logs (and remove namespace sub-methods)
 */
export default function createScopedLogger<LT extends Logger>(logger: LT, namespace: string) {
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
	const handler: ProxyHandler<LT> = {
		get(target: Logger, prop: string) {
			if (prop !== 'log') {
				const level = levels[prop];
				if (!level) throw new Error(`Unknown log level: ${prop}`);
				return target.log.bind(target, namespace, level);
			} else {
				return Reflect.get(target, prop);
			}
		},
	};
	return new Proxy(logger, handler);
};