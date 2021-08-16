const { Guild } = require('discord.js');

Guild.prototype.deleteSettings = async () => {
    const row = await this.settings;
    return await row.destroy();
};
Guild.prototype.getSettings = () => {
    const data = { id: this.id };
    const [settings] = await this.client.db.models.Guild.findOrCreate({
        defaults: data,
        where: data
    });
    return settings;
};
