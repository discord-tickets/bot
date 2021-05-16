const Command = require('../modules/commands/command');
const { MessageEmbed } = require('discord.js');

module.exports = class AddCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			internal: true,
			name: i18n('commands.add.name'),
			description: i18n('commands.add.description'),
			aliases: [],
			process_args: false,
			args: [
				{
					name: i18n('commands.add.args.member.name'),
					description: i18n('commands.add.args.member.description'),
					example: i18n('commands.add.args.member.example'),
					required: true,
				},
				{
					name: i18n('commands.add.args.ticket.name'),
					description: i18n('commands.add.args.ticket.description'),
					example: i18n('commands.add.args.ticket.example'),
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