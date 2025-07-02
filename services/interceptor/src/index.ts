
import { dns } from 'bun';
import {
	logger as log,
	httpLogger,
} from './logger';
import handler from './handler';

dns.prefetch('discord.com', 443);

log.debug(dns.getCacheStats());

Bun.serve({
	error: error => new Response(
		JSON.stringify({ error: error.message }),
		{
			headers: { 'Content-Type': 'application/json' },
			status: 500,
		}),
	fetch: httpLogger.createNativeWrapper(handler),
});
