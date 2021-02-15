/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

module.exports = {
	event: 'error',
	execute(_client, log, [e]) {
		log.error(e);
	}
};