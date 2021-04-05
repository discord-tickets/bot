const { MessageEmbed } = require('discord.js');
const Command = require('../modules/commands/command');
const { footer } = require('../utils/discord');

module.exports = class CloseCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.get(client.config.locale);
		super(client, {
			internal: true,
			name: i18n('commands.close.name'),
			description: i18n('commands.close.description'),
			aliases: [
				i18n('commands.close.aliases.delete'),
			],
			process_args: false,
			args: [
				{
					name: i18n('commands.close.args.ticket.name'),
					description: i18n('commands.close.args.ticket.description'),
					example: i18n('commands.close.args.ticket.example'),
					required: false,
				}
			]
		});
	}

	async execute(message, args) {

		let settings = await message.guild.settings;
		const i18n = this.client.i18n.get(settings.locale);

	}
};