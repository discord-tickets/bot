import type { Logger } from 'leekslazylogger';
import { randomBytes } from 'node:crypto';

type DecoratedRequest = Request & {
	$logger: {
		id: string;
		start: number;
	},
	params: Record<string, string>,
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
}

function getDurationColour(duration: number) {
	if (duration < 100) return '&a'; // light green = fast
	if (duration < 500) return '&e'; // light yellow = slightly slow
	if (duration < 1000) return '&c'; // light red = slow
	return '&4'; // dark red = very slow
}

export const nodeId = process.env.NODE_ID || randomBytes(2).toString('hex');

export let counter = 0;

export default class HTTPLoggingMiddleware {
	public log: Logger;

	constructor(logger: Logger) {
		this.log = logger;
	}

	logErrors(err: Error, req: DecoratedRequest) {
		this.log.error.http?.({
			error: err,
			headers: Object.fromEntries(req.headers),
			id: req.$logger?.id,
			params: req.params,
		});
	}

	logRequests(req: DecoratedRequest) {
		req.$logger = {
			id: `req-${nodeId}-${(counter++).toString(36)}`,
			start: Date.now(),
		};
		const ip = req.headers.get('x-forwarded-for') ?? '?';
		this.log.info.http?.(`${req.$logger.id} &7${ip}&b &m-->&r&b ${req.method} ${new URL(req.url).pathname}`);
		this.log.verbose.http?.(req.$logger.id, Object.fromEntries(req.headers));
	}

	logResponses(res: Response, req: DecoratedRequest) {
		const duration = Date.now() - req.$logger.start;
		this.log.info.http?.(`${req.$logger.id} ${getStatusColour(res.status)}${res.status}&b &m<--&r ${getDurationColour(duration)}${duration}ms`);
	}
}
