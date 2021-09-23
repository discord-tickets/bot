const EventListener = require('../modules/listeners/listener');
const {
	Interaction, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');

module.exports = class InteractionCreateEventListener extends EventListener {
	constructor(client) {
		super(client, { event: 'interactionCreate' });
	}

	/**
	 * @param {Interaction} interaction
	 */
	async execute(interaction) {
		this.client.log.debug(interaction);

		const settings = await this.client.utils.getSettings(interaction.guild);
		const i18n = this.client.i18n.getLocale(settings.locale);

		const blacklisted = settings.blacklist.members.includes[interaction.user.id] ||
			interaction.member?.roles.cache?.some(role => settings.blacklist.roles.includes(role));
		if (blacklisted) {
			return interaction.reply({
				content: i18n('blacklisted'),
				ephemeral: true
			});
		}

		const handlePanel = async id => {
			const cat_row = await this.client.db.models.Category.findOne({ where: { id } });

			if (!cat_row) {
				this.client.log.warn('Could not find a category with the ID given by a panel interaction');
				return interaction.reply({
					embeds: [
						new MessageEmbed()
							.setColor(settings.error_colour)
							.setTitle(i18n('command_execution_error.title'))
							.setDescription(i18n('command_execution_error.description'))
					],
					ephemeral: true
				});
			}

			const tickets = await this.client.db.models.Ticket.findAndCountAll({
				where: {
					category: cat_row.id,
					creator: interaction.user.id,
					open: true
				}
			});

			if (tickets.count >= cat_row.max_per_member) {
				if (cat_row.max_per_member === 1) {
					return interaction.reply({
						embeds: [
							new MessageEmbed()
								.setColor(settings.error_colour)
								.setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
								.setTitle(i18n('commands.new.response.has_a_ticket.title'))
								.setDescription(i18n('commands.new.response.has_a_ticket.description', tickets.rows[0].id))
								.setFooter(settings.footer, interaction.guild.iconURL())
						],
						ephemeral: true
					});
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
					return interaction.reply({
						embeds: [
							new MessageEmbed()
								.setColor(settings.error_colour)
								.setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
								.setTitle(i18n('commands.new.response.max_tickets.title', tickets.count))
								.setDescription(i18n('commands.new.response.max_tickets.description', list.join('\n')))
								.setFooter(settings.footer, interaction.guild.iconURL())
						],
						ephemeral: true
					});
				}
			} else {
				try {
					const t_row = await this.client.tickets.create(interaction.guild.id, interaction.user.id, id);
					return interaction.reply({
						embeds: [
							new MessageEmbed()
								.setColor(settings.success_colour)
								.setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
								.setTitle(i18n('commands.new.response.created.title'))
								.setDescription(i18n('commands.new.response.created.description', `<#${t_row.id}>`))
								.setFooter(settings.footer, interaction.guild.iconURL())
						],
						ephemeral: true
					});
				} catch (error) {
					this.client.log.error(error);
					return interaction.reply({
						embeds: [
							new MessageEmbed()
								.setColor(settings.error_colour)
								.setAuthor(interaction.user.username, interaction.user.displayAvatarURL())
								.setTitle(i18n('commands.new.response.error.title'))
								.setDescription(error.message)
								.setFooter(settings.footer, interaction.guild.iconURL())
						],
						ephemeral: true
					});
				}
			}
		};

		if (interaction.isCommand()) {
			// handle slash commands
			this.client.commands.handle(interaction);
		} else if (interaction.isButton()) {
			if (interaction.customId.startsWith('panel.single')) {
				// handle single-category panels
				handlePanel(interaction.customId.split(':')[1]);
			} else if (interaction.customId.startsWith('ticket.claim')) {
				// handle ticket claiming
			} else if (interaction.customId.startsWith('ticket.close')) {
				// handle ticket close button
			}
		} else if (interaction.isSelectMenu()) {
			if (interaction.customId.startsWith('panel.multiple')) {
				// handle multi-category panels and new command
				handlePanel(interaction.values[0]);
			}
		}
	}
};