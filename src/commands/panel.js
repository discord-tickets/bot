const Command = require('../modules/commands/command');
const {
	Interaction, // eslint-disable-line no-unused-vars
	MessageActionRow,
	MessageButton,
	MessageEmbed,
	MessageSelectMenu
} = require('discord.js');
const { some } = require('../utils');

module.exports = class PanelCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			description: i18n('commands.panel.description'),
			internal: true,
			name: i18n('commands.panel.name'),
			options: [
				{
					description: i18n('commands.panel.options.categories.description'),
					multiple: true,
					name: i18n('commands.panel.options.categories.name'),
					required: true,
					type: Command.option_types.STRING
				},
				{
					description: i18n('commands.panel.options.description.description'),
					name: i18n('commands.panel.options.description.name'),
					required: false,
					type: Command.option_types.STRING
				},
				{
					description: i18n('commands.panel.options.image.description'),
					name: i18n('commands.panel.options.image.name'),
					required: false,
					type: Command.option_types.STRING
				},
				{
					description: i18n('commands.panel.options.just_type.description') + ' (false)',
					name: i18n('commands.panel.options.just_type.name'),
					required: false,
					type: Command.option_types.BOOLEAN
				},
				{
					description: i18n('commands.panel.options.title.description'),
					name: i18n('commands.panel.options.title.name'),
					required: false,
					type: Command.option_types.STRING
				},
				{
					description: i18n('commands.panel.options.thumbnail.description'),
					name: i18n('commands.panel.options.thumbnail.name'),
					required: false,
					type: Command.option_types.STRING
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
		const settings = await this.client.utils.getSettings(interaction.guild.id);
		const default_i18n = this.client.i18n.getLocale(this.client.config.defaults.locale);  // command properties could be in a different locale
		const i18n = this.client.i18n.getLocale(settings.locale);

		const categories = interaction.options.getString(default_i18n('commands.panel.options.categories.name'))
			.replace(/\s/g, '')
			.split(',');
		const description = interaction.options.getString(default_i18n('commands.panel.options.description.name'))?.replace(/\\n/g, '\n');
		const image = interaction.options.getString(default_i18n('commands.panel.options.image.name'));
		const just_type = interaction.options.getBoolean(default_i18n('commands.panel.options.just_type.name'));
		const title = interaction.options.getString(default_i18n('commands.panel.options.title.name'));
		const thumbnail = interaction.options.getString(default_i18n('commands.panel.options.thumbnail.name'));

		if (just_type && categories.length > 1) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.error_colour)
						.setTitle(i18n('commands.panel.response.too_many_categories.title'))
						.setDescription(i18n('commands.panel.response.too_many_categories.description'))
						.setFooter(settings.footer, interaction.guild.iconURL())
				],
				ephemeral: true
			});
		}

		const invalid_category = await some(categories, async id => {
			const cat_row = await this.client.db.models.Category.findOne({
				where: {
					guild: interaction.guild.id,
					id
				}
			});
			return !cat_row;
		});

		if (invalid_category) {
			return await interaction.reply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.error_colour)
						.setTitle(i18n('commands.panel.response.invalid_category.title'))
						.setDescription(i18n('commands.panel.response.invalid_category.description'))
						.setFooter(settings.footer, interaction.guild.iconURL())
				],
				ephemeral: true
			});
		}

		let panel_channel;

		const embed = new MessageEmbed()
			.setColor(settings.colour)
			.setFooter(settings.footer, interaction.guild.iconURL());

		if (description) embed.setDescription(description);
		if (image) embed.setImage(image);
		if (title) embed.setTitle(title);
		if (thumbnail) embed.setThumbnail(thumbnail);

		if (just_type) {
			panel_channel = await interaction.guild.channels.create('create-a-ticket', {
				permissionOverwrites: [
					{
						allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
						deny: ['ATTACH_FILES', 'EMBED_LINKS', 'ADD_REACTIONS'],
						id: interaction.guild.roles.everyone
					},
					{
						allow: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
						id: this.client.user.id
					}
				],
				position: 1,
				rateLimitPerUser: 30,
				reason: `${interaction.user.tag} created a new message panel`,
				type: 'GUILD_TEXT'
			});
			await panel_channel.send({ embeds: [embed] });
			this.client.log.info(`${interaction.user.tag} has created a new message panel`);
		} else {
			panel_channel = await interaction.guild.channels.create('create-a-ticket', {
				permissionOverwrites: [
					{
						allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
						deny: ['SEND_MESSAGES', 'ADD_REACTIONS'],
						id: interaction.guild.roles.everyone
					},
					{
						allow: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
						id: this.client.user.id
					}
				],
				position: 1,
				reason: `${interaction.user.tag} created a new panel`,
				type: 'GUILD_TEXT'
			});

			if (categories.length === 1) {
				// single category
				await panel_channel.send({
					components: [
						new MessageActionRow()
							.addComponents(
								new MessageButton()
									.setCustomId(`panel.single:${categories[0]}`)
									.setLabel(i18n('panel.create_ticket'))
									.setStyle('PRIMARY')
							)
					],
					embeds: [embed]
				});
				this.client.log.info(`${interaction.user.tag} has created a new button panel`);
			} else {
				// multi category
				const rows = await this.client.db.models.Category.findAll({ where: { guild: interaction.guild.id } });
				await panel_channel.send({
					components: [
						new MessageActionRow()
							.addComponents(
								new MessageSelectMenu()
									.setCustomId(`panel.multiple:${panel_channel.id}`)
									.setPlaceholder('Select a category')
									.addOptions(rows.map(row => ({
										label: row.name,
										value: row.id
									})))
							)
					],
					embeds: [embed]
				});
				this.client.log.info(`${interaction.user.tag} has created a new select panel`);
			}
		}

		interaction.reply({
			content: `✅ ${panel_channel}`,
			ephemeral: true
		});

		await this.client.db.models.Panel.create({
			category: categories.length === 1 ? categories[0] : null,
			channel: panel_channel.id,
			guild: interaction.guild.id
		});
	}
};
