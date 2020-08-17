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
	event: 'oUpdate',
	async execute(client, [o, n], {Ticket}) {

		if(!config.transcripts.web.enabled) return;

		if (o.partial) 
			try {
				await o.fetch();
			} catch (err) {
				log.error(err);
				return;
			}

		if (n.partial) 
			try {
				await o.fetch();
			} catch (err) {
				log.error(err);
				return;
			}

		if(o === n) return;

		let ticket = await Ticket.findOne({ where: { channel: o.channel.id } });
		if(!ticket) return;		

		let path = `user/transcripts/raw/${o.channel.id}.log`;
		let embeds = [];
		for (let embed in o.embeds)
			embeds.push(o.embeds[embed].toJSON());

		fs.appendFileSync(path, JSON.stringify({
			id: o.id,
			author: o.author.id,
			content: o.content, // do not use cleanContent!
			time: o.createdTimestamp,
			embeds: embeds,
			attachments: [...o.attachments.values()],
			edited: true
		}) + '\n');
		

	}
};