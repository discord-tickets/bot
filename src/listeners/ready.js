const EventListener = require('../modules/listeners/listener');

module.exports = class ReadyEventListener extends EventListener {
	constructor(client) {
		super(client, {
			event: 'ready',
			once: true
		});
	}

	async execute() {
		this.client.log.success(`Connected to Discord as "${this.client.user.tag}"`);

		this.client.commands.load(); // load internal commands

		this.client.plugins.plugins.forEach(p => p.load()); // call load function for each plugin

		if (this.client.config.presence.presences.length > 1) {
			const { selectPresence } = require('../utils/discord');
			setInterval(() => {
				let presence = selectPresence();
				this.client.user.setPresence(presence);
				this.client.log.debug(`Updated presence: ${presence.activity.type} ${presence.activity.name}`);
			}, this.client.config.presence.duration * 1000);
		}

		if (this.client.config.super_secret_setting) {
			setInterval(async () => {
				await this.client.postStats();
			}, 3600000);
			await this.client.postStats();
		}
	}
};