module.exports = {
	event: 'messageUpdate',
	execute: async (client, oldm, newm) => {

		if (newm.partial) {
			try {
				await newm.fetch();
			} catch (err) {
				return client.log.error(err);
			}
		}

		if (!newm.guild) return;

		let settings = await newm.guild.settings;
		if (!settings) settings = await newm.guild.createSettings();

		if (settings.log_messages && !newm.system) client.tickets.archives.updateMessage(newm); // update the message in the database
	}
};