const Command = require('../modules/commands/command');
const {
	Interaction, // eslint-disable-line no-unused-vars,
	MessageActionRow,
	MessageEmbed,
	MessageSelectMenu
} = require('discord.js');

module.exports = class NewCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			description: i18n('commands.new.description'),
			internal: true,
			name: i18n('commands.new.name'),
			options: [
				{
					description: i18n('commands.new.options.topic.description'),
					name: i18n('commands.new.options.topic.name'),
					required: false,
					type: Command.option_types.STRING
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

		const topic = interaction.options.getString(default_i18n('commands.new.options.topic.name'));

		const create = async (cat_row, i) => {
			const tickets = await this.client.db.models.Ticket.findAndCountAll({
				where: {
					category: cat_row.id,
					creator: interaction.user.id,
					open: true
				}
			});

			if (tickets.count >= cat_row.max_per_member) {
				if (cat_row.max_per_member === 1) {
					const response = {
						components: [],
						embeds: [
							new MessageEmbed()
								.setColor(settings.error_colour)
								.setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
								.setTitle(i18n('commands.new.response.has_a_ticket.title'))
								.setDescription(i18n('commands.new.response.has_a_ticket.description', tickets.rows[0].id))
								.setFooter(settings.footer, interaction.guild.iconURL())
						],
						ephemeral: true
					};
					await i ? i.editReply(response) : interaction.editReply(response);
				} else {
					const list = tickets.rows.map(row => {
						if (row.topic) {
							const description = row.topic.substring(0, 30);
							const ellipses = row.topic.length > 30 ? '...' : '';
							return `<#${row.id}>: \`${description}${ellipses}\``;
						} else {
							return `<#${row.id}>`;
						}
					});
					const response = {
						components: [],
						embeds: [
							new MessageEmbed()
								.setColor(settings.error_colour)
								.setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
								.setTitle(i18n('commands.new.response.max_tickets.title', tickets.count))
								.setDescription(i18n('commands.new.response.max_tickets.description', list.join('\n')))
								.setFooter(settings.footer, interaction.guild.iconURL())
						],
						ephemeral: true
					};
					await i ? i.editReply(response) : interaction.editReply(response);
				}
			} else {
				try {
					const t_row = await this.client.tickets.create(interaction.guild.id, interaction.user.id, cat_row.id, topic);
					const response = {
						components: [],
						embeds: [
							new MessageEmbed()
								.setColor(settings.success_colour)
								.setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
								.setTitle(i18n('commands.new.response.created.title'))
								.setDescription(i18n('commands.new.response.created.description', `<#${t_row.id}>`))
								.setFooter(settings.footer, interaction.guild.iconURL())
						],
						ephemeral: true
					};
					await i ? i.editReply(response) : interaction.editReply(response);
				} catch (error) {
					const response = {
						components: [],
						embeds: [
							new MessageEmbed()
								.setColor(settings.error_colour)
								.setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
								.setTitle(i18n('commands.new.response.error.title'))
								.setDescription(error.message)
								.setFooter(settings.footer, interaction.guild.iconURL())
						],
						ephemeral: true
					};
					await i ? i.editReply(response) : interaction.editReply(response);
				}
			}
		};

		const categories = await this.client.db.models.Category.findAndCountAll({ where: { guild: interaction.guild.id } });

		if (categories.count === 0) {
			return await interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.error_colour)
						.setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
						.setTitle(i18n('commands.new.response.no_categories.title'))
						.setDescription(i18n('commands.new.response.no_categories.description'))
						.setFooter(settings.footer, interaction.guild.iconURL())
				]
			});
		} else if (categories.count === 1) {
			create(categories.rows[0]); // skip the category selection
		} else {
			await interaction.editReply({
				components: [
					new MessageActionRow()
						.addComponents(
							new MessageSelectMenu()
								.setCustomId(`select_category:${interaction.id}`)
								.setPlaceholder('Select a category')
								.addOptions(categories.rows.map(row => ({
									label: row.name,
									value: row.id
								})))
						)
				],
				embeds: [
					new MessageEmbed()
						.setColor(settings.colour)
						.setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
						.setTitle(i18n('commands.new.response.select_category.title'))
						.setDescription(i18n('commands.new.response.select_category.description'))
						.setFooter(this.client.utils.footer(settings.footer, i18n('collector_expires_in', 30)), interaction.guild.iconURL())
				],
				ephemeral: true
			});

			const filter = i => i.user.id === interaction.user.id && i.customId.includes(interaction.id);
			const collector = interaction.channel.createMessageComponentCollector({
				filter,
				time: 30000
			});

			collector.on('collect', async i => {
				await i.deferUpdate();
				create(categories.rows.find(row => row.id === i.values[0]), i);
				collector.stop();
			});

			collector.on('end', async collected => {
				if (collected.size === 0) {
					await interaction.editReply({
						components: [],
						embeds: [
							new MessageEmbed()
								.setColor(settings.error_colour)
								.setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
								.setTitle(i18n('commands.new.response.select_category_timeout.title'))
								.setDescription(i18n('commands.new.response.select_category_timeout.description'))
								.setFooter(settings.footer, interaction.guild.iconURL())
						],
						ephemeral: true
					});
				}
			});
		}
	}
};
