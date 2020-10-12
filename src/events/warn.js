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
	event: 'warn',
	execute(_client, [e]) {
		log.warn(e);
	}
};