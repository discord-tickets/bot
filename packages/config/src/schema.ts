import { z } from 'zod/v4';

export default z.object({
	'interceptor/discord_api_version': z.string(),
	'log_level': z.enum([
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
