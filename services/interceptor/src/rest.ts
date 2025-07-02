import { createRestManager } from '@discordeno/rest';
import { createScopedLogger } from '@discord-tickets/logger';
import { logger } from './logger';

// TODO: one per bot

export const REST = createRestManager({
	logger: createScopedLogger(logger, 'discordeno/rest'),
	token: Bun.env.TOKEN,
});