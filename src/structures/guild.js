const { Structures } = require('discord.js');

Structures.extend('Guild', Guild => {
	return class extends Guild {
		constructor(client, data) {
			super(client, data);
		}

		createSettings() {
			return this.client.db.models.Guild.create({
				id: this.id
			});
		}

		async deleteSettings() {
			const row = await this.settings;
			return await row.destroy();
		}

		get settings() {
			return this.client.db.models.Guild.findOne({
				where: {
					id: this.id
				}
			});
		}
	};
});