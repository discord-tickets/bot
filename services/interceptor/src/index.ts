
import {
	service,
	log,
} from '@discord-tickets/service';
service.name = 'interceptor';

import { dns } from 'bun';
import { handleWithLogs } from '@discord-tickets/logger/http';
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
	fetch: handleWithLogs(handler),
});
