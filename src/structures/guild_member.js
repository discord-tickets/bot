const { Structures } = require('discord.js');

Structures.extend('GuildMember', GuildMember => class extends GuildMember {
	constructor(client, data, guild) {
		super(client, data, guild);
	}

	async isStaff() {
		const guild_categories = await this.client.db.models.Category.findAll({ where: { guild: this.guild.id } });

		return guild_categories.some(cat => cat.roles.some(r => this.roles.cache.has(r)));
	}

});