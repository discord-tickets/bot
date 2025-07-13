import {
	createRestManager,
	type ApiVersions,
	type RestManager,
} from '@discordeno/rest';
import { createScopedLogger } from '@discord-tickets/logger';
import config from '@discord-tickets/config';
import log from './logger';

// TODO: REQUIRE AUTH!
export const REST = createRestManager({
	logger: createScopedLogger(log, 'discordeno/rest'),
	token: process.env.TOKEN,
	version: config.get('interceptor.discord_api_version') as ApiVersions,
});

const managers: Map<string, RestManager> = new Map();

config.watch(['interceptor.discord_api_version'], version => {
	log.info.config('interceptor.discord_api_version=%s', version);
	for (const [, man] of managers) {
		man.version = version as ApiVersions;
	}
});