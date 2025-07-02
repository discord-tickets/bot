import createLogger, { http } from '@discord-tickets/logger';

export const logger = createLogger({ namespaces: ['http'] });

export const httpLogger = new http.HTTPLoggingMiddleware(logger);