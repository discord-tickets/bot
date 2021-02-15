/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

const fs = require('fs');
const { join } = require('path');

module.exports = {
	event: 'messageDelete',
	async execute(_client, log, [message], {config, Ticket}) {
		if (!config.transcripts.web.enabled) return;

		if (message.partial) {
			try {
				await message.fetch();
			} catch (err) {
				log.warn('Failed to fetch deleted message');
				log.error(err.message);
				return;
			}
		}

		let ticket = await Ticket.findOne({ where: { channel: message.channel.id } });
		if (!ticket) return;


		let path = `../../user/transcripts/raw/${message.channel.id}.log`;
		let embeds = [];
		for (let embed in message.embeds) embeds.push(message.embeds[embed].toJSON());

		fs.appendFileSync(join(__dirname, path), JSON.stringify({
			id: message.id,
			author: message.author.id,
			content: message.content, // do not use cleanContent!
			time: message.createdTimestamp,
			embeds: embeds,
			attachments: [...message.attachments.values()],
			edited: message.edits.length > 1,
			deleted: true // delete the message
		}) + '\n');
	}
};