/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

module.exports = {
	event: 'warn',
	execute(_client, log, [e]) {
		log.warn(e);
	}
};