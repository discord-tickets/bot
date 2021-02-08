/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

module.exports = {
	event: 'debug',
	execute(_client, log, [e]) {
		log.debug(e);
	}
};