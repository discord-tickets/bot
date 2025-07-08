import { z } from 'zod/v4';

export type Schema = z.infer<typeof schema>;

export const schema = z.object({
	'global/log_level': z.optional(
		z.enum([
			'debug',
			'verbose',
			'info',
			'success',
			'warn',
			'notice',
			'error',
			'critical',
			'fatal',
		]),
	),
	'interceptor/discord_api_version': z.optional(z.string()),
	'nice': z.optional(z.number()),
});
