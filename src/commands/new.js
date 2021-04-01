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
			process_args: false,
			args: [
				{
					name: i18n('commands.new.args.topic.name'),
					description: i18n('commands.new.args.topic.description'),
					example: i18n('commands.new.args.topic.example'),
					required: false,
				}
			]
		});
	}

	async execute(message, args) {

		let settings = await message.guild.settings;
		const i18n = this.client.i18n.get(settings.locale);

		let { count: cat_count, rows: categories } = await this.client.db.models.Category.findAndCountAll({
			where: {
				guild: message.guild.id
			}
		});

		switch (cat_count) {
		case 0:
			return await message.channel.send(
				new MessageEmbed()
					.setColor(settings.error_colour)
					.setTitle(i18n('commands.new.response.no_categories.title'))
					.setDescription(i18n('commands.new.response.no_categories.description'))
			);
		case 1:
			break;
		default:
		}

		

		// this.client.tickets.create(message.guild.id, message.member.id, '825861413687787560', args.topic);
	}
};