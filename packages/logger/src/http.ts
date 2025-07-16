import type { Logger } from '@discord-tickets/logger';
import { service } from '@discord-tickets/service';
import { randomBytes } from 'node:crypto';

export type DecoratedRequest = Request & {
	id: string;
	log: Logger;
}

export const nodeId = process.env.NODE_ID || randomBytes(2).toString('hex');

export let counter = 0;

export function decorateRequest(log: Logger, req: Request): DecoratedRequest {
	const decorated = req as DecoratedRequest;
	decorated.id =  `req-${nodeId}-${(counter++).toString(36)}`;;
	decorated.log = log.child({ 'req-id': decorated.id }) as DecoratedRequest['log'];
	return decorated;
}

export function resolveIP(server: Bun.Server | undefined, req: Request) {
	return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
			req.headers.get('x-real-ip') ||
			req.headers.get('cf-connecting-ip') ||
			server?.requestIP?.(req)?.address;
}

export function handleWithLogs(handler: (req: Request) => Promise<Response>) {
	const log = service.logWithName('http');
	return async (req: Request, server?: Bun.Server): Promise<Response> => {
		const start = performance.now();
		const decorated = decorateRequest(log, req);
		decorated.log.info({
			ip: resolveIP(server, req),
			method: req.method,
			path: new URL(req.url).pathname,
		}, 'request');
		let res: Response;
		try {
			res = await handler.call(server, decorated);
			const duration = Math.round(performance.now() - start);
			decorated.log.info({
				duration,
				status: res.status,
			}, 'response');
			return res;
		} catch (err) {
			const duration = Math.round(performance.now() - start);
			decorated.log.error({
				duration,
				err,
				status: 500,
			}, 'error');
			// ! rethrow error after logging for the server to handle
			throw err;
		}
	};
}