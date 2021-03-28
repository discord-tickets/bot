module.exports = {
	event: 'rateLimit',
	execute: (client, limit) => {
		client.log.warn('Rate-limited!', limit);
	}
};