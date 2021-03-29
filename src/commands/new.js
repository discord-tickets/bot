const { MessageEmbed } = require('discord.js');
const Command = require('../modules/commands/command');

module.exports = class NewCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.get(client.config.locale);
		super(client, {
			internal: true,
			name: i18n('commands.new.name'),
			description: i18n('commands.new.description'),
			aliases: [
				i18n('commands.new.aliases.open'),
				i18n('commands.new.aliases.create'),
			],
			args: [
				{
					name: i18n('commands.new.args.category.name'),
					description: i18n('commands.new.args.topic.description'),
					required: true,
				},
				{
					name: i18n('commands.new.args.topic.name'),
					description: i18n('commands.new.args.topic.description'),
					required: false,
				}
			]
		});
	}

	async execute(message, args, raw_args) {

		let settings = await message.guild.settings;
		const i18n = this.client.i18n.get(settings.locale);

		await message.channel.send(
			new MessageEmbed()
				.setColor(settings.colour)
				.setTitle(i18n('bot.version', require('../../package.json').version))
				.setDescription(args.topic)
		);

		// console.log(this.aliases)
		// console.log(args.category)
		// console.log(args.topic)

		// this.client.tickets.create(message.guild.id, message.member.id, '825861413687787560', args.topic);
	}
};