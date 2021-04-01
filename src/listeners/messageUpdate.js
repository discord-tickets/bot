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

		let settings = await newm.guild?.settings;

		if (settings?.log_messages) {
			if (newm.system) return;
			client.tickets.archives.updateMessage(newm);
		}
	}
};