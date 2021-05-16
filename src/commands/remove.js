const Command = require('../modules/commands/command');
const { MessageEmbed } = require('discord.js');

module.exports = class RemoveCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			internal: true,
			name: i18n('commands.remove.name'),
			description: i18n('commands.remove.description'),
			aliases: [],
			process_args: false,
			args: [
				{
					name: i18n('commands.remove.args.member.name'),
					description: i18n('commands.remove.args.member.description'),
					example: i18n('commands.remove.args.member.example'),
					required: true,
				},
				{
					name: i18n('commands.remove.args.ticket.name'),
					description: i18n('commands.remove.args.ticket.description'),
					example: i18n('commands.remove.args.ticket.example'),
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