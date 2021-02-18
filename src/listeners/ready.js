module.exports = {
	event: 'ready',
	once: true,
	execute: (client) => {
		const { log } = client;

		log.success(`Connected to Discord as "${client.user.tag}"`);

		/**
		 * OH NO, TELEMETRY!?
		 * Relax, it just counts how many people are using DiscordTickets.
		 */
		if (client.config.super_secret_setting) {
			const fetch = require('node-fetch');
			fetch(`https://discordtickets-telemetry.eartharoid.repl.co/?id=${client.user.id}`, {
				method: 'post',
			}).catch(e => {
				// fail quietly, it doesn't really matter if it didn't work
				log.debug('Warning: failed to post to discordtickets-telemetry');
				log.debug(e);
			});
		}

		client.commands.load(); // load internal commands

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