const Command = require('../modules/commands/command');
const {
	Interaction, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

module.exports = class RemoveCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			description: i18n('commands.remove.description'),
			internal: true,
			name: i18n('commands.remove.name'),
			options: [
				{
					description: i18n('commands.remove.options.member.description'),
					name: i18n('commands.remove.options.member.name'),
					required: true,
					type: Command.option_types.USER
				},
				{
					description: i18n('commands.remove.options.ticket.description'),
					name: i18n('commands.remove.options.ticket.name'),
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

		const channel = interaction.options.getChannel(default_i18n('commands.remove.options.channel.name')) ?? interaction.channel;
		const t_row = await this.client.tickets.resolve(channel.id, interaction.guild.id);

		if (!t_row) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.error_colour)
						.setTitle(i18n('commands.remove.response.not_a_channel.title'))
						.setDescription(i18n('commands.remove.response.not_a_channel.description'))
						.setFooter(settings.footer, interaction.guild.iconURL())
				],
				ephemeral: true
			});
		}

		const member = interaction.options.getMember(default_i18n('commands.remove.options.member.name'));

		if (!member) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.error_colour)
						.setTitle(i18n('commands.remove.response.no_member.title'))
						.setDescription(i18n('commands.remove.response.no_member.description'))
						.setFooter(settings.footer, interaction.guild.iconURL())
				],
				ephemeral: true
			});
		}

		if (t_row.creator !== interaction.user.id && !await this.client.utils.isStaff(interaction.member)) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.error_colour)
						.setTitle(i18n('commands.remove.response.no_permission.title'))
						.setDescription(i18n('commands.remove.response.no_permission.description'))
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
					.setTitle(i18n('commands.remove.response.removed.title'))
					.setDescription(i18n('commands.remove.response.removed.description', member.toString(), channel.toString()))
					.setFooter(settings.footer, interaction.guild.iconURL())
			],
			ephemeral: true
		});

		await channel.send({
			embeds: [
				new MessageEmbed()
					.setColor(settings.colour)
					.setAuthor(member.user.username, member.user.displayAvatarURL())
					.setTitle(i18n('ticket.member_removed.title'))
					.setDescription(i18n('ticket.member_removed.description', member.toString(), interaction.user.toString()))
					.setFooter(settings.footer, interaction.guild.iconURL())
			]
		});

		await channel.permissionOverwrites.delete(member.user.id, `${interaction.user.tag} removed ${member.user.tag} from the ticket`);

		this.client.log.info(`${interaction.user.tag} removed ${member.user.tag} from ${channel.id}`);
	}
};
