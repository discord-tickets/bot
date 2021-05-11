const Command = require('../modules/commands/command');
const { MessageEmbed } = require('discord.js');
const { footer } = require('../utils/discord');

module.exports = class TransferCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			internal: true,
			name: i18n('commands.transfer.name'),
			description: i18n('commands.transfer.description'),
			aliases: [],
			process_args: false,
			args: [
				{
					name: i18n('commands.transfer.args.member.name'),
					description: i18n('commands.transfer.args.member.description'),
					example: i18n('commands.transfer.args.member.example'),
					required: false,
				}
			],
			staff_only: true
		});
	}

	async execute(message, args) {
		let settings = await message.guild.settings;
		const i18n = this.client.i18n.getLocale(settings.locale);
	}
};