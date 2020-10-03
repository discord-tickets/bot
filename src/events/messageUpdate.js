/**
 *
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 *
 */

const ChildLogger = require('leekslazylogger').ChildLogger;
const log = new ChildLogger();
const fs = require('fs');

module.exports = {
	event: 'messageUpdate',
	async execute(client, [o, n], {config, Ticket}) {

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
				await n.fetch();
			} catch (err) {
				log.error(err);
				return;
			}

		let ticket = await Ticket.findOne({ where: { channel: n.channel.id } });
		if(!ticket) return;

		let path = `user/transcripts/raw/${n.channel.id}.log`;
		let embeds = [];
		for (let embed in n.embeds)
			embeds.push({ ...n.embeds[embed] });

		fs.appendFileSync(path, JSON.stringify({
			id: n.id,
			author: n.author.id,
			content: n.content, // do not use cleanContent!
			time: n.createdTimestamp,
			embeds: embeds,
			attachments: [...n.attachments.values()],
			edited: true
		}) + '\n');

	}
};