const Command = require('../modules/commands/command');
const {
	Message, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

module.exports = class RemoveCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			aliases: [],
			args: [
				{
					description: i18n('commands.remove.args.member.description'),
					example: i18n('commands.remove.args.member.example'),
					name: i18n('commands.remove.args.member.name'),
					required: true
				},
				{
					description: i18n('commands.remove.args.ticket.description'),
					example: i18n('commands.remove.args.ticket.example'),
					name: i18n('commands.remove.args.ticket.name'),
					required: false
				}
			],
			description: i18n('commands.remove.description'),
			internal: true,
			name: i18n('commands.remove.name'),
			process_args: false
		});
	}

	/**
	 * @param {Message} message
	 * @param {string} args
	 * @returns {Promise<void|any>}
	 */
	async execute(message, args) {
		const settings = await this.client.utils.getSettings(message.guild);
		const i18n = this.client.i18n.getLocale(settings.locale);

		const ticket = message.mentions.channels.first() ?? message.channel;
		const t_row = await this.client.tickets.resolve(ticket.id, message.guild.id);

		if (!t_row) {
			return await message.channel.send({
				embeds: [new MessageEmbed()
					.setColor(settings.error_colour)
					.setTitle(i18n('commands.remove.response.not_a_ticket.title'))
					.setDescription(i18n('commands.remove.response.not_a_ticket.description'))
					.setFooter(settings.footer, message.guild.iconURL())]
			});
		}

		const member = message.mentions.members.first() ?? message.guild.members.cache.get(args);

		if (!member) {
			return await message.channel.send({
				embeds: [new MessageEmbed()
					.setColor(settings.error_colour)
					.setTitle(i18n('commands.remove.response.no_member.title'))
					.setDescription(i18n('commands.remove.response.no_member.description'))
					.setFooter(settings.footer, message.guild.iconURL())]
			});
		}

		if (t_row.creator !== message.author.id && !await this.client.utils.isStaff(message.member)) {
			return await message.channel.send({
				embeds: [new MessageEmbed()
					.setColor(settings.error_colour)
					.setTitle(i18n('commands.remove.response.no_permission.title'))
					.setDescription(i18n('commands.remove.response.no_permission.description'))
					.setFooter(settings.footer, message.guild.iconURL())]
			});
		}

		if (message.channel.id !== ticket.id) {
			await message.channel.send({
				embeds: [new MessageEmbed()
					.setColor(settings.success_colour)
					.setAuthor(member.user.username, member.user.displayAvatarURL())
					.setTitle(i18n('commands.remove.response.removed.title'))
					.setDescription(i18n('commands.remove.response.removed.description', member.toString(), ticket.toString()))
					.setFooter(settings.footer, message.guild.iconURL())]
			});
		}

		await ticket.send({
			embeds: [new MessageEmbed()
				.setColor(settings.colour)
				.setAuthor(member.user.username, member.user.displayAvatarURL())
				.setTitle(i18n('ticket.member_removed.title'))
				.setDescription(i18n('ticket.member_removed.description', member.toString(), message.author.toString()))
				.setFooter(settings.footer, message.guild.iconURL())]
		});

		await ticket.permissionOverwrites
			.get(member.user.id)
			?.delete(`${message.author.tag} removed ${member.user.tag} from the ticket`);

		this.client.log.info(`${message.author.tag} removed ${member.user.tag} from ${ticket.id}`);
	}
};
