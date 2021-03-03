module.exports = {
	event: 'ready',
	once: true,
	execute: (client) => {
		const { log } = client;

		log.success(`Connected to Discord as "${client.user.tag}"`);

		/**
		 * OH NO, TELEMETRY!?
		 * Relax, it just counts how many people are using DiscordTickets by storing the bot's ID.
		 * You can see the source here: <https://repl.it/@eartharoid/DiscordTickets-Telemetry#index.js>
		 */
		if (client.config.super_secret_setting) { // you can disable it if you really want
			const fetch = require('node-fetch');
			fetch(`https://telemetry.discordtickets.app/?id=${client.user.id}`, {
				method: 'post',
			}).catch(e => {
				// fail quietly, it doesn't really matter if it didn't work
				log.debug('Warning: failed to post to telemetry.discordtickets.app');
				log.debug(e);
			});
		}

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
		
	}
};