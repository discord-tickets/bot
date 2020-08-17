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
const dtf = require('@eartharoid/dtf');
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


module.exports.addMessage = async (client, message) => {

	if(config.transcripts.text.enabled) { // text transcripts
		let path = `user/transcripts/text/${message.channel.id}.txt`,
			time = dtf('HH:mm:ss n_D MMM YY', message.createdAt),
			msg = message.cleanContent;
		message.attachments.each(a => msg += '\n' + a.url);
		let string = `[${time}] [${message.author.tag}] :> ${msg}`;
		fs.appendFileSync(path, string + '\n');
	}

	if(config.transcripts.web.enabled) { // web archives
		let raw = `user/transcripts/raw/${message.channel.id}.log`,
			json = `user/transcripts/raw/entities/${message.channel.id}.json`;
		
		let embeds = [];
		for (let embed in message.embeds)
			embeds.push(message.embeds[embed].toJSON());
		
		// message
		fs.appendFileSync(raw, JSON.stringify({
			id: message.id,
			author: message.author.id,
			content: message.content, // do not use cleanContent!
			time: message.createdTimestamp,
			embeds: embeds,
			attachments: [...message.attachments.values()]
		}) + '\n');
		
		// channel entities
		if(!fs.existsSync(json))
			await fs.writeFileSync(json, '{}');
		
		let entities = await JSON.parse(fs.readFileSync(json));

		if(!entities.users[message.author.id]) {
			entities.users[message.author.id] = {
				avatar: message.author.avatarURL(),
				username: message.author.username,
				discriminator: message.author.discriminator,
				displayName: message.member.displayName,
				color: message.member.displayColor,
				badge: message.author.bot ? 'bot' : null
			};
		}

		message.mentions.channels.each(c => entities.channels[c.id].name = c.name);

		message.mentions.roles.each(r => entities.roles[r.id] = {
			name: r.name,
			color: r.color
		});
		
	}
};

module.exports.export = (client, channel) => {
	let path = `user/transcripts/raw/${channel.id}.log`;

	return new Promise((resolve, reject) => {
		if(!config.transcripts.web.enabled || !fs.existsSync(path))
			return reject(false);

		lineReader.eachLine(path, (line, last) => {
			console.log(line);
			// if raw id exists, overwrite previous
			// also: channel_name
		});
	});
};