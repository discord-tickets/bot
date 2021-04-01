module.exports = {
	event: 'message',
	execute: async (client, message) => {

		let settings = await message.guild?.settings;

		// message collection for t_row archiving 
		if (settings?.log_messages) {
			if (message.system) return;

			let t_row = await client.db.models.Ticket.findOne({
				where: {
					id: message.channel.id
				}
			});

			if (t_row) {
				let embeds = [];
				for (let embed in message.embeds) embeds.push({ ...message.embeds[embed] });

				await client.db.models.Message.create({
					id: message.id,
					ticket: t_row.id,
					author: message.author.id,
					data: {
						content: message.content,
						// time: message.createdTimestamp,
						embeds,
						attachments: [...message.attachments.values()]
					}
				});
			}
		}

		client.commands.handle(message);
	}
};