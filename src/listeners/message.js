module.exports = {
	event: 'message',
	execute: async (client, message) => {

		let settings = await message.guild.settings;

		if (settings.log_messages) {
			if (message.type !== 'DEFAULT') return;

			let ticket = await client.tickets.get(message.channel.id);

			if (ticket) {
				client.db.models.Message.create({
					id: message.id,
					ticket: ticket.id,
					author: message.author.id
				});
			}
		}
		
	}
};