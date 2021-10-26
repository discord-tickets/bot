const Command = require('../modules/commands/command');
const {
	Interaction, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			description: i18n('commands.help.description'),
			internal: true,
			name: i18n('commands.help.name')
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await this.client.utils.getSettings(interaction.guild.id);
		const i18n = this.client.i18n.getLocale(settings.locale);

		const is_staff = await this.client.utils.isStaff(interaction.member);
		const commands = this.manager.commands.filter(command => {
			if (command.permissions.length >= 1) return interaction.member.permissions.has(command.permissions);
			else if (command.staff_only) return is_staff;
			else return true;
		});
		const list = commands.map(command => {
			const description = command.description.length > 50
				? command.description.substring(0, 50) + '...'
				: command.description;
			return `**\`/${command.name}\` ·** ${description}`;
		});
		return await interaction.reply({
			embeds: [
				new MessageEmbed()
					.setColor(settings.colour)
					.setTitle(i18n('commands.help.response.list.title'))
					.setDescription(i18n('commands.help.response.list.description'))
					.addField(i18n('commands.help.response.list.fields.commands'), list.join('\n'))
					.setFooter(settings.footer, interaction.guild.iconURL())
			],
			ephemeral: true
		});
	}
};
