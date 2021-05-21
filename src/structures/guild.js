const { Structures } = require('discord.js');

Structures.extend('Guild', Guild => class extends Guild {
	constructor(client, data) {
		super(client, data);
	}

	async deleteSettings() {
		const row = await this.settings;
		return await row.destroy();
	}

	async getSettings() {
		const data = { id: this.id };
		const [settings] = await this.client.db.models.Guild.findOrCreate({
			defaults: data,
			where: data
		});
		return settings;
	}
});