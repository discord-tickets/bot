/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();
const fetch = require('node-fetch');
const config = require('../../user/config');
let {version} = require('../../package.json');
version = 'v' + version;

module.exports = () => {
	if(!config.updater)
		return;
		
	fetch('https://api.github.com/repos/eartharoid/DiscordTickets/releases')
		.then(res => res.json())
		.then(json => {
			const update = json[0];

			if (version !== update.tag_name) {
				log.notice('There is an update available for Discord Tickets');
				log.info(`Download "&f${update.name}&3" from &6https://github.com/eartharoid/DiscordTickets/releases/`);
				log.notice(`You currently have ${version}; The latest is ${update.tag_name}`);
			}
		});
};