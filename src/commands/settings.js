/* eslint-disable max-lines */
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
									description: i18n('commands.settings.options.categories.options.delete.options.id.description'),
									name: i18n('commands.settings.options.categories.options.delete.options.id.name'),
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
						},
						{
							description: i18n('commands.settings.options.categories.options.list.description'),
							name: i18n('commands.settings.options.categories.options.list.name'),
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
		const default_i18n = this.client.i18n.getLocale(); // command properties may be in a different locale
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
			await this.client.commands.updatePermissions(interaction.guild);
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
		case default_i18n('commands.settings.options.categories.options.delete.name'): {
			const category = await this.client.db.models.Category.findOne({ where: { id: interaction.options.getString('id') } });
			if (category) {
				await category.destroy();
				interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor(settings.success_colour)
							.setTitle(i18n('commands.settings.response.category_deleted', category.name))
					],
					ephemeral: true
				});
			} else {
				interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor(settings.error_colour)
							.setTitle(i18n('commands.settings.response.category_does_not_exist'))
					],
					ephemeral: true
				});
			}
			break;
		}
		case default_i18n('commands.settings.options.categories.options.edit.name'): {
			const category = await this.client.db.models.Category.findOne({ where: { id: interaction.options.getString('id') } });
			if (!category) {
				return interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor(settings.error_colour)
							.setTitle(i18n('commands.settings.response.category_does_not_exist'))
					],
					ephemeral: true
				});
			}
			const claiming = interaction.options.getBoolean(default_i18n('commands.settings.options.categories.options.edit.options.claiming.name'));
			const image = interaction.options.getString(default_i18n('commands.settings.options.categories.options.edit.options.image.name'));
			const max_per_member = interaction.options.getInteger(default_i18n('commands.settings.options.categories.options.edit.options.max_per_member.name'));
			const name = interaction.options.getString(default_i18n('commands.settings.options.categories.options.edit.options.name.name'));
			const name_format = interaction.options.getString(default_i18n('commands.settings.options.categories.options.edit.options.name_format.name'));
			const opening_message = interaction.options.getString(default_i18n('commands.settings.options.categories.options.edit.options.opening_message.name'));
			const ping = interaction.options.getString(default_i18n('commands.settings.options.categories.options.edit.options.ping.name'));
			const require_topic = interaction.options.getBoolean(default_i18n('commands.settings.options.categories.options.edit.options.require_topic.name'));
			const roles = interaction.options.getString(default_i18n('commands.settings.options.categories.options.edit.options.roles.name'));
			const survey = interaction.options.getString(default_i18n('commands.settings.options.categories.options.edit.options.survey.name'));
			if (claiming !== null) category.set('claiming', claiming);
			if (max_per_member !== null) category.set('max_per_member', max_per_member);
			if (image !== null) category.set('image', image);
			if (name !== null) category.set('name', name);
			if (name_format !== null) category.set('name_format', name_format);
			if (opening_message !== null) category.set('opening_message', opening_message);
			if (ping !== null) category.set('ping', ping);
			if (require_topic !== null) category.set('require_topic', require_topic);
			if (roles !== null) category.set('roles', roles);
			if (survey !== null) category.set('survey', survey);
			await category.save();
			interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.success_colour)
						.setTitle(i18n('commands.settings.response.category_updated', category.name))
				],
				ephemeral: true
			});
			break;
		}
		case default_i18n('commands.settings.options.categories.options.list.name'): {
			const categories = await this.client.db.models.Category.findAll({ where: { guild: interaction.guild.id } });
			await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.colour)
						.setTitle(i18n('commands.settings.response.category_list'))
						.setDescription(categories.map(c => `- ${c.name} (\`${c.id}\`)`).join('\n'))
				],
				ephemeral: true
			});
			break;
		}
		case default_i18n('commands.settings.options.set.name'): {
			const colour = interaction.options.getString(default_i18n('commands.settings.options.set.options.colour.name'));
			const error_colour = interaction.options.getString(default_i18n('commands.settings.options.set.options.error_colour.name'));
			const footer = interaction.options.getString(default_i18n('commands.settings.options.set.options.footer.name'));
			const locale = interaction.options.getString(default_i18n('commands.settings.options.set.options.locale.name'));
			const log_messages = interaction.options.getBoolean(default_i18n('commands.settings.options.set.options.log_messages.name'));
			const success_colour = interaction.options.getString(default_i18n('commands.settings.options.set.options.success_colour.name'));
			if (colour !== null) settings.set('colour', colour);
			if (error_colour !== null) settings.set('error_colour', error_colour);
			if (footer !== null) settings.set('footer', footer);
			if (locale !== null) settings.set('locale', locale);
			if (log_messages !== null) settings.set('log_messages', log_messages);
			if (success_colour !== null) settings.set('success_colour', success_colour);
			await settings.save();
			interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.success_colour)
						.setTitle(i18n('commands.settings.response.settings_updated'))
				],
				ephemeral: true
			});
			break;
		}
		}
	}
};