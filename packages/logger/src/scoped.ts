import type { Logger } from 'leekslazylogger';
import type {
	LogLevel,
	LogLevelType,
} from 'leekslazylogger/types/types';

/**
 * Apply a namespace to all logs (and disable namespace sub-methods)
 */
export default function createScopedLogger<LT extends Logger>(logger: LT, namespace: string) {
	const levels = new Map(
		logger.levels
			.map(name => ([name, <LogLevel>{
				name,
				number: logger.levels.indexOf(name),
				type: (logger.options.levels[name] || 'info') as LogLevelType,
			}])),
	);
	const handler: ProxyHandler<LT> = {
		get(target, prop) {
			const level = levels.get(prop as string);
			if (level) {
				return target.log.bind(target, namespace, level);
			} else {
				return Reflect.get(target, prop);
			}
		},
	};
	return new Proxy(logger, handler);
};