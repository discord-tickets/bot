const { Structures } = require('discord.js');

Structures.extend('Guild', Guild => {
	return class extends Guild {
		constructor(client, data) {
			super(client, data);
		}

		get settings() {
			return this.client.db.Guild.findOne({
				where: {
					id: this.id
				}
			});
		}
	};
});