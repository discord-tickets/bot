// import type { BunRequest } from 'bun';
import type { Logger } from 'leekslazylogger';
import { randomBytes } from 'node:crypto';

export type DecoratedRequest = Request & {
	$logger: {
		id: string;
		ip?: string;
		start: number;
	}
}

export const nodeId = process.env.NODE_ID || randomBytes(2).toString('hex');

export let counter = 0;

export function decorateRequest(server: Bun.Server | undefined, req: Request): DecoratedRequest {
	const decorated = req as DecoratedRequest;
	decorated.$logger = {
		id: `req-${nodeId}-${(counter++).toString(36)}`,
		ip: resolveIP(server, req),
		start: performance.now(),
	};
	return decorated;
}

export function getDurationColour(duration: number) {
	if (duration < 100) return '&a'; // light green = fast
	if (duration < 500) return '&e'; // light yellow = slightly slow
	if (duration < 1000) return '&c'; // light red = slow
	return '&4'; // dark red = very slow
}

export function getStatusColour(status: number) {
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

export class HTTPLogger {
	public log: Logger;

	constructor(logger: Logger) {
		this.log = logger;
	}

	logError(err: unknown, req: DecoratedRequest) {
		this.log.error.http?.({
			error: err,
			id: req.$logger.id,
		});
	}

	logRequest(req: DecoratedRequest) {
		this.log.info.http?.(`${req.$logger.id} &7${req.$logger.ip ?? '?'}&b &m-->&r&b ${req.method} ${new URL(req.url).pathname}`);
		this.log.verbose.http?.(req.$logger.id, Object.fromEntries(req.headers));
	}

	logResponse(req: DecoratedRequest, res: Response) {
		const duration = performance.now() - req.$logger.start;
		this.log.info.http?.(`${req.$logger.id} ${getStatusColour(res.status)}${res.status}&b &m<--&r ${getDurationColour(duration)}${Math.round(duration)}ms`);
	}
}


export function resolveIP(server: Bun.Server | undefined, req: Request) {
	return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
			req.headers.get('x-real-ip') ||
			req.headers.get('cf-connecting-ip') ||
			server?.requestIP?.(req)?.address;
}

export function handleWithLogs(logger: Logger, handler: (req: Request) => Promise<Response>) {
	const httpLogger = new HTTPLogger(logger);
	return async (req: Request, server?: Bun.Server): Promise<Response> => {
		const decorated = decorateRequest(server, req);
		httpLogger.logRequest(decorated);
		let res;
		try {
			res = await handler.call(server, decorated);
			httpLogger.logResponse(decorated, res);
			return res;
		} catch (error) {
			httpLogger.logError(error, decorated);
			// ! rethrow error after logging for the server to handle (the response WON'T be logged)
			throw error;
		}
	};
}