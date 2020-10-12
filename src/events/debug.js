/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

const Logger = require('leekslazylogger');
const log = new Logger();

module.exports = {
	event: 'debug',
	execute(_client, [e]) {
		log.debug(e);
	}
};