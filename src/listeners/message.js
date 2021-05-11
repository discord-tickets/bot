module.exports = {
	event: 'message',
	execute: async (client, message) => {
		if (!message.guild) return;

		let settings = await message.guild.settings;
		if (!settings) settings = await message.guild.createSettings();

		let t_row = await client.db.models.Ticket.findOne({
			where: {
				id: message.channel.id
			}
		});

		if (t_row) {
			if (settings.log_messages && !message.system) {
				client.tickets.archives.addMessage(message); // add the message to the archives (if it is in a ticket channel)
			}

			const ignore = [client.user.id, t_row.creator];
			if (!t_row.first_response && !ignore.includes(message.author.id)) {
				t_row.update({
					first_response: new Date()
				});
			}
		} else {
			let p_row = await client.db.models.Panel.findOne({
				where: {
					channel: message.channel.id
				}
			});

			if (p_row) {
				// handle reaction-less panel
			}
		}

		client.commands.handle(message); // pass the message to the command handler
	}
};