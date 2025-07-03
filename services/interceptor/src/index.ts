
import { dns } from 'bun';
import { http } from '@discord-tickets/logger';
import { logger as log } from './logger';
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
	fetch: http.handleWithLogs(log, handler),
});
