const Command = require('../modules/commands/command');
const { MessageEmbed } = require('discord.js');

module.exports = class StatsCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			internal: true,
			name: i18n('commands.stats.name'),
			description: i18n('commands.stats.description'),
			aliases: [],
			process_args: false,
			args: [],
			staff_only: true
		});
	}

	async execute(message, args) {
		let settings = await message.guild.settings;
		const i18n = this.client.i18n.getLocale(settings.locale);
	}
};