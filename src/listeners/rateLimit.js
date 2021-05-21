const EventListener = require('../modules/listeners/listener');

module.exports = class RateLimitEventListener extends EventListener {
	constructor(client) {
		super(client, { event: 'rateLimit' });
	}

	async execute(limit) {
		this.client.log.warn('Rate-limited!', limit);
	}
};