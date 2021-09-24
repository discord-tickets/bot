const Command = require('../modules/commands/command');
const {
	Interaction, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

module.exports = class AddCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			description: i18n('commands.add.description'),
			internal: true,
			name: i18n('commands.add.name'),
			options: [
				{
					description: i18n('commands.add.options.member.description'),
					name: i18n('commands.add.options.member.name'),
					required: true,
					type: Command.option_types.USER
				},
				{
					description: i18n('commands.add.options.ticket.description'),
					name: i18n('commands.add.options.ticket.name'),
					required: false,
					type: Command.option_types.CHANNEL
				}
			]
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await this.client.utils.getSettings(interaction.guild.id);
		const default_i18n = this.client.i18n.getLocale(this.client.config.defaults.locale);  // command properties could be in a different locale
		const i18n = this.client.i18n.getLocale(settings.locale);

		const channel = interaction.options.getChannel(default_i18n('commands.add.options.ticket.name')) ?? interaction.channel;
		const t_row = await this.client.tickets.resolve(channel.id, interaction.guild.id);

		if (!t_row) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.error_colour)
						.setTitle(i18n('commands.add.response.not_a_ticket.title'))
						.setDescription(i18n('commands.add.response.not_a_ticket.description'))
						.setFooter(settings.footer, interaction.guild.iconURL())
				],
				ephemeral: true
			});
		}

		const member = interaction.options.getMember(default_i18n('commands.add.options.member.name'));

		if (!member) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.error_colour)
						.setTitle(i18n('commands.add.response.no_member.title'))
						.setDescription(i18n('commands.add.response.no_member.description'))
						.setFooter(settings.footer, interaction.guild.iconURL())
				],
				ephemeral: true
			});
		}

		if (t_row.creator !== interaction.member.id && !await this.client.utils.isStaff(interaction.member)) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.error_colour)
						.setTitle(i18n('commands.add.response.no_permission.title'))
						.setDescription(i18n('commands.add.response.no_permission.description'))
						.setFooter(settings.footer, interaction.guild.iconURL())
				],
				ephemeral: true
			});
		}

		await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor(settings.success_colour)
					.setAuthor(member.user.username, member.user.displayAvatarURL())
					.setTitle(i18n('commands.add.response.added.title'))
					.setDescription(i18n('commands.add.response.added.description', member.toString(), channel.toString()))
					.setFooter(settings.footer, interaction.guild.iconURL())
			],
			ephemeral: true
		});

		await channel.send({
			embeds: [
				new MessageEmbed()
					.setColor(settings.colour)
					.setAuthor(member.user.username, member.user.displayAvatarURL())
					.setTitle(i18n('ticket.member_added.title'))
					.setDescription(i18n('ticket.member_added.description', member.toString(), interaction.user.toString()))
					.setFooter(settings.footer, interaction.guild.iconURL())
			]
		});

		await channel.permissionOverwrites.edit(member, {
			ATTACH_FILES: true,
			READ_MESSAGE_HISTORY: true,
			SEND_MESSAGES: true,
			VIEW_CHANNEL: true
		}, `${interaction.user.tag} added ${member.user.tag} to the ticket`);

		await this.client.tickets.archives.updateMember(channel.id, member);

		this.client.log.info(`${interaction.user.tag} added ${member.user.tag} to ${channel.id}`);
	}
};
