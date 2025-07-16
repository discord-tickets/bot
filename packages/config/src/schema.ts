import { z } from 'zod/v4';

export const schema = z.object({
	// interceptor: z.object({ discord_api_version: z.string().regex(/^v/) }),
	interceptor: z.object({ discord_api_version: z.int().gte(10) }),
	log_level: z.enum([
		'trace',
		'debug',
		'info',
		'warn',
		'error',
		'fatal',
	]),
});
