const Command = require('../modules/commands/command');
const {
	Interaction, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

module.exports = class SettingsCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			description: i18n('commands.settings.description'),
			internal: true,
			name: i18n('commands.settings.name'),
			options: [
				{
					description: i18n('commands.settings.options.categories.description'),
					name: i18n('commands.settings.options.categories.name'),
					options: [
						{
							description: i18n('commands.settings.options.categories.options.create.description'),
							name: i18n('commands.settings.options.categories.options.create.name'),
							options: [
								{
									description: i18n('commands.settings.options.categories.options.create.options.name.description'),
									name: i18n('commands.settings.options.categories.options.create.options.name.name'),
									required: true,
									type: Command.option_types.STRING
								},
								{
									description: i18n('commands.settings.options.categories.options.create.options.roles.description'),
									name: i18n('commands.settings.options.categories.options.create.options.roles.name'),
									required: true,
									type: Command.option_types.STRING
								}
							],
							type: Command.option_types.SUB_COMMAND
						},
						{
							description: i18n('commands.settings.options.categories.options.delete.description'),
							name: i18n('commands.settings.options.categories.options.delete.name'),
							options: [
								{
									description: i18n('commands.settings.options.categories.options.delete.options.category.description'),
									name: i18n('commands.settings.options.categories.options.delete.options.category.name'),
									required: true,
									type: Command.option_types.STRING
								}
							],
							type: Command.option_types.SUB_COMMAND
						},
						{
							description: i18n('commands.settings.options.categories.options.edit.description'),
							name: i18n('commands.settings.options.categories.options.edit.name'),
							options: [
								{
									description: i18n('commands.settings.options.categories.options.edit.options.id.description'),
									name: i18n('commands.settings.options.categories.options.edit.options.id.name'),
									required: true,
									type: Command.option_types.STRING
								},
								{
									description: i18n('commands.settings.options.categories.options.edit.options.claiming.description'),
									name: i18n('commands.settings.options.categories.options.edit.options.claiming.name'),
									required: false,
									type: Command.option_types.BOOLEAN
								},
								{
									description: i18n('commands.settings.options.categories.options.edit.options.image.description'),
									name: i18n('commands.settings.options.categories.options.edit.options.image.name'),
									required: false,
									type: Command.option_types.STRING
								},
								{
									description: i18n('commands.settings.options.categories.options.edit.options.max_per_member.description'),
									name: i18n('commands.settings.options.categories.options.edit.options.max_per_member.name'),
									required: false,
									type: Command.option_types.INTEGER
								},
								{
									description: i18n('commands.settings.options.categories.options.edit.options.name.description'),
									name: i18n('commands.settings.options.categories.options.edit.options.name.name'),
									required: false,
									type: Command.option_types.STRING
								},
								{
									description: i18n('commands.settings.options.categories.options.edit.options.name_format.description'),
									name: i18n('commands.settings.options.categories.options.edit.options.name_format.name'),
									required: false,
									type: Command.option_types.STRING
								},
								{
									description: i18n('commands.settings.options.categories.options.edit.options.opening_message.description'),
									name: i18n('commands.settings.options.categories.options.edit.options.opening_message.name'),
									required: false,
									type: Command.option_types.STRING
								},
								{
									description: i18n('commands.settings.options.categories.options.edit.options.ping.description'),
									name: i18n('commands.settings.options.categories.options.edit.options.ping.name'),
									required: false,
									type: Command.option_types.STRING
								},
								{
									description: i18n('commands.settings.options.categories.options.edit.options.require_topic.description'),
									name: i18n('commands.settings.options.categories.options.edit.options.require_topic.name'),
									required: false,
									type: Command.option_types.BOOLEAN
								},
								{
									description: i18n('commands.settings.options.categories.options.edit.options.roles.description'),
									name: i18n('commands.settings.options.categories.options.edit.options.roles.name'),
									required: false,
									type: Command.option_types.STRING
								},
								{
									description: i18n('commands.settings.options.categories.options.edit.options.survey.description'),
									name: i18n('commands.settings.options.categories.options.edit.options.survey.name'),
									required: false,
									type: Command.option_types.STRING
								}
							],
							type: Command.option_types.SUB_COMMAND
						}
					],
					type: Command.option_types.SUB_COMMAND_GROUP
				},
				{
					description: i18n('commands.settings.options.set.description'),
					name: i18n('commands.settings.options.set.name'),
					options: [
						{
							description: i18n('commands.settings.options.set.options.colour.description'),
							name: i18n('commands.settings.options.set.options.colour.name'),
							required: false,
							type: Command.option_types.STRING
						},
						{
							description: i18n('commands.settings.options.set.options.error_colour.description'),
							name: i18n('commands.settings.options.set.options.error_colour.name'),
							required: false,
							type: Command.option_types.STRING
						},
						{
							description: i18n('commands.settings.options.set.options.footer.description'),
							name: i18n('commands.settings.options.set.options.footer.name'),
							required: false,
							type: Command.option_types.STRING
						},
						{
							description: i18n('commands.settings.options.set.options.locale.description'),
							name: i18n('commands.settings.options.set.options.locale.name'),
							required: false,
							type: Command.option_types.STRING
						},
						{
							description: i18n('commands.settings.options.set.options.log_messages.description'),
							name: i18n('commands.settings.options.set.options.log_messages.name'),
							required: false,
							type: Command.option_types.BOOLEAN
						},
						{
							description: i18n('commands.settings.options.set.options.success_colour.description'),
							name: i18n('commands.settings.options.set.options.success_colour.name'),
							required: false,
							type: Command.option_types.STRING
						}
					],
					type: Command.option_types.SUB_COMMAND
				}
			],
			permissions: ['MANAGE_GUILD']
		});

	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await this.client.utils.getSettings(interaction.guild);
		const default_i18n = this.client.i18n.getLocale();
		const i18n = this.client.i18n.getLocale(settings.locale);

		switch (interaction.options.getSubcommand()) {
		case default_i18n('commands.settings.options.categories.options.create.name'): {
			const name = interaction.options.getString('name');
			const roles = interaction.options.getString('roles')?.replace(/\s/g, '').split(',');
			const allowed_permissions = ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'];
			const cat_channel = await interaction.guild.channels.create(name, {
				permissionOverwrites: [
					...[
						{
							deny: ['VIEW_CHANNEL'],
							id: interaction.guild.roles.everyone
						},
						{
							allow: allowed_permissions,
							id: this.client.user.id
						}
					],
					...roles.map(r => ({
						allow: allowed_permissions,
						id: r
					}))
				],
				position: 1,
				reason: `Tickets category created by ${interaction.user.tag}`,
				type: 'GUILD_CATEGORY'
			});
			await this.client.db.models.Category.create({
				guild: interaction.guild.id,
				id: cat_channel.id,
				name,
				roles
			});
			interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.success_colour)
						.setTitle(i18n('commands.settings.response.category_created', name))
				],
				ephemeral: true
			});
			break;
		}
		case default_i18n('commands.settings.options.categories.options.delete.name'):
		{ break; }
		case default_i18n('commands.settings.options.categories.options.edit.name'):
		{ break; }
		case default_i18n('commands.settings.options.categories.options.set.name'):
		default:
		{ break; }
		}
	}
};