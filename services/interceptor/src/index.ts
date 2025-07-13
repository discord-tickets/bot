import config from '@discord-tickets/config';
import log from './logger';

process.on('uncaughtException', (error, origin) => log.critical(origin, error));
config.on('critical', error => log.critical.config(error));

config.watch(['log_level'], level => {
	log.info.config('log_level=%s', level);
	log.options.transports.forEach(t => (t.level = level));
});

import { dns } from 'bun';
import { http } from '@discord-tickets/logger';
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
