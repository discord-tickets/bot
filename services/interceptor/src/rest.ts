import {
	config,
	service,
} from '@discord-tickets/service';
import {
	createRestManager,
	type ApiVersions,
	type RestManager,
} from '@discordeno/rest';

const logger = service.logWithName('rest');

// TODO: REQUIRE AUTH!
export const REST = createRestManager({
	logger,
	token: process.env.TOKEN,
	version: config.get('interceptor.discord_api_version') as ApiVersions,
});

const managers: Map<string, RestManager> = new Map();

config.watch(['interceptor.discord_api_version'], version => {
	logger.trace('discord_api_version=%d', version);
	for (const [, man] of managers) {
		man.version = version as ApiVersions;
	}
});
