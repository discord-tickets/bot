/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const Discord = require('discord.js');
const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();
const config = require('../../user/config');
const fs = require('fs');
const dtf = require('@eartharoid/dtf');

module.exports = {
	event: 'messageDelete',
	async execute(client, [message], {Ticket}) {

		if(!config.transcripts.web.enabled) return;

		if (message.partial) 
			try {
				await message.fetch();
			} catch (err) {
				log.error(err);
				return;
			}

		let ticket = await Ticket.findOne({ where: { channel: message.channel.id } });
		if(!ticket) return;
		

		let path = `user/transcripts/raw/${message.channel.id}.log`;
		let embeds = [];
		for (let embed in message.embeds)
			embeds.push(message.embeds[embed].toJSON());

		fs.appendFileSync(path, JSON.stringify({
			id: message.id,
			author: message.author.id,
			content: message.content, // do not use cleanContent!
			time: message.createdTimestamp,
			embeds: embeds,
			attachments: [...message.attachments.values()],
			deleted: true
		}) + '\n');

	}
};