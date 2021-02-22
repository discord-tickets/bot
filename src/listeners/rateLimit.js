module.exports = {
	event: 'rateLimit',
	execute: (client, limit) => {
		client.log.warn('Rate-limited!');
		client.log.debug(limit);
	}
};