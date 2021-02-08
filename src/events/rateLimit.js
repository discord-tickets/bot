/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

module.exports = {
	event: 'rateLimit',
	execute(_client, log, [limit]) {
		log.warn('Rate-limited! (Enable debug mode in config for details)');
		log.debug(limit);
	}
};