const Command = require('../modules/commands/command');
const { MessageEmbed } = require('discord.js');

module.exports = class TopicCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			internal: true,
			name: i18n('commands.topic.name'),
			description: i18n('commands.topic.description'),
			aliases: [],
			process_args: false,
			args: [
				{
					name: i18n('commands.topic.args.new_topic.name'),
					description: i18n('commands.topic.args.new_topic.description'),
					example: i18n('commands.topic.args.new_topic.example'),
					required: true,
				}
			]
		});
	}

	async execute(message, args) {
		let settings = await message.guild.settings;
		const i18n = this.client.i18n.getLocale(settings.locale);
	}
};