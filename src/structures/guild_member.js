const { GuildMember } = require('discord.js');

GuildMember.prototype.isStaff = async () => {
    const guild_categories = await this.client.db.models.Category.findAll({ where: { guild: this.guild.id } });
    return guild_categories.some(cat => cat.roles.some(r => this.roles.cache.has(r)));
};
