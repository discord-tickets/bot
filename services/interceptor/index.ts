
import { dns } from 'bun';
import { Logger } from 'leekslazylogger';
import { transport } from '@discord-tickets/logger/console';
import HTTPLoggingMiddleware from '@discord-tickets/logger/http';
import handler from './handler';

dns.prefetch('discord.com', 443);

const logger = new Logger({
	namespaces: ['http'],
	transports: [transport],
});
const httpLogger = new HTTPLoggingMiddleware(logger);

console.log(dns.getCacheStats());

Bun.serve({
	error: error => new Response(
		JSON.stringify({ error: error.message }),
		{
			headers: { 'Content-Type': 'application/json' },
			status: 500,
		}),
	fetch: httpLogger.createNativeWrapper(handler),
});
