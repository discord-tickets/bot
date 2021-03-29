module.exports = {
	event: 'message',
	execute: async (client, message) => {

		let settings = await message.guild?.settings;

		// message collection for ticket archiving 
		if (settings?.log_messages) {
			if (message.system) return;

			let ticket = await client.db.models.Ticket.findOne({
				where: {
					id: message.channel.id
				}
			});

			if (ticket) {
				await client.db.models.Message.create({
					id: message.id,
					ticket: ticket.id,
					author: message.author.id,
					updates: [{
						content: message.content,
						time: message.createdTimestamp,
						embeds: message.embeds.map(embed => {
							return { ...message.embeds[embed] };
						}),
						attachments: [ ...message.attachments.values() ]
					}]
				});
			}
		}

		client.commands.handle(message);
	}
};