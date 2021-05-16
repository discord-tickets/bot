const Command = require('../modules/commands/command');
const { MessageEmbed } = require('discord.js');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			internal: true,
			name: i18n('commands.help.name'),
			description: i18n('commands.help.description'),
			aliases: [
				i18n('commands.help.aliases.command'),
				i18n('commands.help.aliases.commands'),
			],
			process_args: false,
			args: [
				{
					name: i18n('commands.help.args.command.name'),
					description: i18n('commands.help.args.command.description'),
					example: i18n('commands.help.args.command.example'),
					required: false,
				}
			]
		});
	}

	async execute(message, args) {
		let settings = await message.guild.settings;
		const i18n = this.client.i18n.getLocale(settings.locale);
	}
};