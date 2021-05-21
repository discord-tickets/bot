const { Structures } = require('discord.js');

Structures.extend('Guild', Guild => {
	return class extends Guild {
		constructor(client, data) {
			super(client, data);
		}

		async deleteSettings() {
			const row = await this.settings;
			return await row.destroy();
		}

		get settings() {
			const data = {
				id: this.id
			};
			return this.client.db.models.Guild.findOrCreate({
				defaults: data,
				where: data
			});
		}
	};
});