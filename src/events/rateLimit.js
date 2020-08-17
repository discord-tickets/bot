/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();

module.exports = {
	event: 'rateLimit',
	execute(client, [limit]) {
		log.warn('Rate-limited! (Enable debug mode in config for details)');
		log.debug(limit);
	}
};