import {
	createRestManager,
	type ApiVersions,
} from '@discordeno/rest';
import { createScopedLogger } from '@discord-tickets/logger';
import log from './logger';
import config from '@discord-tickets/config';

// TODO: one per bot

export const REST = createRestManager({
	logger: createScopedLogger(log, 'discordeno/rest'),
	token: process.env.TOKEN,
	version: config.get('interceptor.discord_api_version') as ApiVersions,
});

config.watch(['interceptor.discord_api_version'], version => {
	log.info.config('Updating Discord API version from %s to %s', REST.version, version);
	REST.version = version as ApiVersions;
});