import { z } from 'zod/v4';

export default z.object({
	// interceptor: z.object({ discord_api_version: z.string().regex(/^v/) }),
	interceptor: z.object({ discord_api_version: z.int() }),
	log_level: z.enum([
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
});
