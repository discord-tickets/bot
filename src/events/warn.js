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
	event: 'warn',
	execute(_client, [e]) {
		log.warn(e);
	}
};