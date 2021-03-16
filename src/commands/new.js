const { MessageEmbed } = require('discord.js');
const { OptionTypes } = require('../modules/commands/helpers');
const Command = require('../modules/commands/command');

module.exports = class NewCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.get(client.config.locale);
		super(client, {
			internal: true,
			name: i18n('commands.new.name'),
			description: i18n('commands.new.description'),
			options: [
				{
					name: i18n('commands.new.options.category.name'),
					type: OptionTypes.STRING,
					description: i18n('commands.new.options.topic.description'),
					required: true,
				},
				{
					name: i18n('commands.new.options.topic.name'),
					type: OptionTypes.STRING,
					description: i18n('commands.new.options.topic.description'),
					required: false,
				}
			]
		});
	}

	async execute({ guild, member, channel, args }, interaction) {

		let settings = await guild.settings;
		const i18n = this.client.i18n.get(settings.locale);

		await channel.send(
			new MessageEmbed()
				.setColor(settings.colour)
				.setTitle(i18n('bot.version', require('../../package.json').version))
				.setDescription(args.topic)
		);
	}
};