import { createRestManager } from '@discordeno/rest';

// TODO: one per bot

export const REST = createRestManager({ token: Bun.env.TOKEN });