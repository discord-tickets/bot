const Command = require('../modules/commands/command');
// eslint-disable-next-line no-unused-vars
const { MessageEmbed, Message } = require('discord.js');

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

	/**
	 * @param {Message} message
	 * @param {string} args
	 * @returns {Promise<void|any>}
	 */
	async execute(message, args) {
		const settings = await message.guild.settings;
		const i18n = this.client.i18n.getLocale(settings.locale);

		const t_row = await this.client.db.models.Ticket.findOne({
			where: {
				id: message.channel.id
			}
		});

		if (!t_row) {
			return await message.channel.send(
				new MessageEmbed()
					.setColor(settings.error_colour)
					.setTitle(i18n('commands.topic.response.not_a_ticket.title'))
					.setDescription(i18n('commands.topic.response.not_a_ticket.description'))
					.setFooter(settings.footer, message.guild.iconURL())
			);
		}

		await t_row.update({
			topic: this.client.cryptr.encrypt(args)
		});

		const member = await message.guild.members.fetch(t_row.creator);
		/* await  */message.channel.setTopic(`${member} | ${args}`, { reason: 'User updated ticket topic' });

		const cat_row = await this.client.db.models.Category.findOne({
			where: {
				id: t_row.category
			}
		});
		const description = cat_row.opening_message
			.replace(/{+\s?(user)?name\s?}+/gi, member.displayName)
			.replace(/{+\s?(tag|ping|mention)?\s?}+/gi, member.user.toString());
		const opening_message = await message.channel.messages.fetch(t_row.opening_message);

		await opening_message.edit(
			new MessageEmbed()
				.setColor(settings.colour)
				.setAuthor(member.user.username, member.user.displayAvatarURL())
				.setDescription(description)
				.addField(i18n('ticket.opening_message.fields.topic'), args)
				.setFooter(settings.footer, message.guild.iconURL())
		);

		await message.channel.send(
			new MessageEmbed()
				.setColor(settings.success_colour)
				.setAuthor(message.author.username, message.author.displayAvatarURL())
				.setTitle(i18n('commands.topic.response.changed.title'))
				.setDescription(i18n('commands.topic.response.changed.description'))
				.setFooter(settings.footer, message.guild.iconURL())
		);

		this.client.log.info(`${message.author.tag} changed the topic of ${message.channel.id}`);
	}
};