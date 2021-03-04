module.exports = {
	event: 'ready',
	once: true,
	execute: async (client) => {

		client.log.success(`Connected to Discord as "${client.user.tag}"`);

		client.commands.load(); // load internal commands

		client.plugins.plugins.forEach(p => p.load()); // call load function for each plugin

		if (client.config.presence.presences.length > 1) {
			const { selectPresence } = require('../utils/discord');
			setInterval(() => {
				let presence = selectPresence();
				client.user.setPresence(presence);
				client.log.debug(`Updated presence: ${presence.activity.type} ${presence.activity.name}`);
			}, client.config.presence.duration * 1000);
		}

		if(client.config.super_secret_setting) {
			setInterval(async () => {
				await client.postStats();
			}, 3600000);
			await client.postStats();
		}
		
	}
};