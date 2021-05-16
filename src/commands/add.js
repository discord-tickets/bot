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

		let ticket = message.mentions.channels.first() ?? message.channel;
		let t_row = await this.client.tickets.resolve(ticket.id, message.guild.id);	

		if (!t_row) {
			return await message.channel.send(
				new MessageEmbed()
					.setColor(settings.error_colour)
					.setTitle(i18n('commands.add.response.not_a_ticket.title'))
					.setDescription(i18n('commands.add.response.not_a_ticket.description'))
					.setFooter(settings.footer, message.guild.iconURL())
			);
		}

		let member = message.mentions.members.first() ?? message.guild.members.cache.get(args);

		if (!member) {
			return await message.channel.send(
				new MessageEmbed()
					.setColor(settings.error_colour)
					.setTitle(i18n('commands.add.response.no_member.title'))
					.setDescription(i18n('commands.add.response.no_member.description'))
					.setFooter(settings.footer, message.guild.iconURL())
			);
		}

		if (t_row.creator !== message.author.id && !await message.member.isStaff()) {
			return await message.channel.send(
				new MessageEmbed()
					.setColor(settings.error_colour)
					.setTitle(i18n('commands.add.response.no_permission.title'))
					.setDescription(i18n('commands.add.response.no_permission.description'))
					.setFooter(settings.footer, message.guild.iconURL())
			);
		}

		if (message.channel.id !== ticket.id) {
			await message.channel.send(
				new MessageEmbed()
					.setColor(settings.success_colour)
					.setAuthor(member.user.username, member.user.displayAvatarURL())
					.setTitle(i18n('commands.add.response.added.title'))
					.setDescription(i18n('commands.add.response.added.description', member.toString(), ticket.toString()))
					.setFooter(settings.footer, message.guild.iconURL())
			);
		}

		await ticket.send(
			new MessageEmbed()
				.setColor(settings.colour)
				.setAuthor(member.user.username, member.user.displayAvatarURL())
				.setTitle(i18n('ticket.member_added.title'))
				.setDescription(i18n('ticket.member_added.description', member.toString(), message.author.toString()))
				.setFooter(settings.footer, message.guild.iconURL())
		);

		await ticket.updateOverwrite(member, {
			VIEW_CHANNEL: true,
			READ_MESSAGE_HISTORY: true,
			SEND_MESSAGES: true,
			ATTACH_FILES: true
		}, `${message.author.tag} added ${member.user.tag} to the ticket`);

		this.client.log.info(`${message.author.tag} added ${member.user.tag} to ${ticket.id}`);
	}
};