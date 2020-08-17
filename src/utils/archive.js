/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();
const lineReader = require('line-reader');
const fs = require('fs');
const config = require('../../user/config');

module.exports.create = (client, channel) => {

	// channel.members

	if(config.transcripts.text.enabled) {
		// text/channel.txt
	}

	if(config.transcripts.web.enabled) {
		// raw/channel.log
	}
	
};


module.exports.addMessage = (client, channel, message) => {
	// if !entities.users.user, add
};

module.exports.export = (client, channel) => {
	let path = `user/transcripts/raw/${channel.id}.log`;
	if(config.transcripts.web.enabled && fs.existsSync(path)) {
		lineReader.eachLine(path, (line, last) => {
			console.log(line);
			//if raw id exists, overwrite previous
		});
	}
	
	


	/**
	 * @TODO users, roles, etc 
	 * check channel.members again!
	 * */
};