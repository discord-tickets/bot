const Command = require('../modules/commands/command');
const {
	Interaction, // eslint-disable-line no-unused-vars
	MessageEmbed,
	Role
} = require('discord.js');

module.exports = class BlacklistCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			description: i18n('commands.blacklist.description'),
			internal: true,
			name: i18n('commands.blacklist.name'),
			options: [
				{
					description: i18n('commands.blacklist.options.add.description'),
					name: i18n('commands.blacklist.options.add.name'),
					options: [
						{
							description: i18n('commands.blacklist.options.add.options.member_or_role.description'),
							name: i18n('commands.blacklist.options.add.options.member_or_role.name'),
							required: true,
							type: Command.option_types.MENTIONABLE
						}
					],
					type: Command.option_types.SUB_COMMAND
				},
				{
					description: i18n('commands.blacklist.options.remove.description'),
					name: i18n('commands.blacklist.options.remove.name'),
					options: [
						{
							description: i18n('commands.blacklist.options.remove.options.member_or_role.description'),
							name: i18n('commands.blacklist.options.remove.options.member_or_role.name'),
							required: true,
							type: Command.option_types.MENTIONABLE
						}
					],
					type: Command.option_types.SUB_COMMAND
				},
				{
					description: i18n('commands.blacklist.options.show.description'),
					name: i18n('commands.blacklist.options.show.name'),
					type: Command.option_types.SUB_COMMAND
				}
			],
			staff_only: true
		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await this.client.utils.getSettings(interaction.guild);
		const default_i18n = this.client.i18n.getLocale(this.client.config.defaults.locale);  // command properties could be in a different locale
		const i18n = this.client.i18n.getLocale(settings.locale);
		const blacklist = JSON.parse(JSON.stringify(settings.blacklist)); // not the same as `const blacklist = { ...settings.blacklist };` ..?

		switch (interaction.options.getSubcommand()) {
		case default_i18n('commands.blacklist.options.add.name'): {
			const member_or_role = interaction.options.getMentionable(default_i18n('commands.blacklist.options.add.options.member_or_role.name'));
			const type = member_or_role instanceof Role ? 'role' : 'member';

			if (type === 'member' && await this.client.utils.isStaff(member_or_role)) {
				return await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor(settings.error_colour)
							.setTitle(i18n('commands.blacklist.response.illegal_action.title'))
							.setDescription(i18n('commands.blacklist.response.illegal_action.description', member_or_role.toString()))
							.setFooter(settings.footer, interaction.guild.iconURL())
					],
					ephemeral: true
				});
			}

			blacklist[type + 's'].push(member_or_role.id);
			await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.success_colour)
						.setTitle(i18n(`commands.blacklist.response.${type}_added.title`))
						.setDescription(i18n(`commands.blacklist.response.${type}_added.description`, member_or_role.id))
						.setFooter(settings.footer, interaction.guild.iconURL())
				],
				ephemeral: true
			});
			await settings.update({ blacklist });
			break;
		}
		case default_i18n('commands.blacklist.options.remove.name'): {
			const member_or_role = interaction.options.getMentionable(default_i18n('commands.blacklist.options.remove.options.member_or_role.name'));
			const type = member_or_role instanceof Role ? 'role' : 'member';
			const index = blacklist[type + 's'].findIndex(element => element === member_or_role.id);

			if (index === -1) {
				return await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor(settings.error_colour)
							.setTitle(i18n('commands.blacklist.response.invalid.title'))
							.setDescription(i18n('commands.blacklist.response.invalid.description'))
							.setFooter(settings.footer, interaction.guild.iconURL())
					],
					ephemeral: true
				});
			}

			blacklist[type + 's'].splice(index, 1);
			await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.success_colour)
						.setTitle(i18n(`commands.blacklist.response.${type}_removed.title`))
						.setDescription(i18n(`commands.blacklist.response.${type}_removed.description`, member_or_role.id))
						.setFooter(settings.footer, interaction.guild.iconURL())
				],
				ephemeral: true
			});
			await settings.update({ blacklist });
			break;
		}
		case default_i18n('commands.blacklist.options.show.name'): {
			if (blacklist.members.length === 0 && blacklist.roles.length === 0) {
				return await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor(settings.colour)
							.setTitle(i18n('commands.blacklist.response.empty_list.title'))
							.setDescription(i18n('commands.blacklist.response.empty_list.description'))
							.setFooter(settings.footer, interaction.guild.iconURL())
					],
					ephemeral: true
				});
			} else {
				const members = blacklist.members.map(id => `**·** <@${id}>`);
				const roles = blacklist.roles.map(id => `**·** <@&${id}>`);
				return await interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor(settings.colour)
							.setTitle(i18n('commands.blacklist.response.list.title'))
							.addField(i18n('commands.blacklist.response.list.fields.members'), members.join('\n') || 'none')
							.addField(i18n('commands.blacklist.response.list.fields.roles'), roles.join('\n') || 'none')
							.setFooter(settings.footer, interaction.guild.iconURL())
					],
					ephemeral: true
				});
			}
		}
		}
	}
};
