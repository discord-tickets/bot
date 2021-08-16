const EventListener = require('../modules/listeners/listener');

const { MessageEmbed } = require('discord.js');
const { footer } = require('../utils/discord');

module.exports = class MessageCreateEventListener extends EventListener {
	constructor(client) {
		super(client, { event: 'messageCreate' });
	}

	async execute(message) {
		if (!message.guild) return;

		const settings = await this.client.utils.getSettings(message.guild);
		const i18n = this.client.i18n.getLocale(settings.locale);

		const t_row = await this.client.db.models.Ticket.findOne({ where: { id: message.channel.id } });

		if (t_row) {
			if (settings.log_messages && !message.system) this.client.tickets.archives.addMessage(message); // add the message to the archives (if it is in a ticket channel)

			const ignore = [this.client.user.id, t_row.creator];
			if (!t_row.first_response && !ignore.includes(message.author.id)) t_row.first_response = new Date();

			t_row.last_message = new Date();
			await t_row.save();
		} else {
			if (message.author.bot) return;

			const p_row = await this.client.db.models.Panel.findOne({ where: { channel: message.channel.id } });

			if (p_row && typeof p_row.categories === 'string') {
				// handle reaction-less panel

				await message.delete();

				const cat_row = await this.client.db.models.Category.findOne({ where: { id: p_row.categories } });

				const tickets = await this.client.db.models.Ticket.findAndCountAll({
					where: {
						category: cat_row.id,
						creator: message.author.id,
						open: true
					}
				});

				let response;

				if (tickets.count >= cat_row.max_per_member) {
					if (cat_row.max_per_member === 1) {
						const embed = new MessageEmbed()
							.setColor(settings.error_colour)
							.setAuthor(message.author.username, message.author.displayAvatarURL())
							.setTitle(i18n('commands.new.response.has_a_ticket.title'))
							.setDescription(i18n('commands.new.response.has_a_ticket.description', tickets.rows[0].id))
							.setFooter(footer(settings.footer, i18n('message_will_be_deleted_in', 15)), message.guild.iconURL());
						try {
							response = await message.author.send(embed);
						} catch {
							response = await message.channel.send(embed);
						}
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
						const embed = new MessageEmbed()
							.setColor(settings.error_colour)
							.setAuthor(message.author.username, message.author.displayAvatarURL())
							.setTitle(i18n('commands.new.response.max_tickets.title', tickets.count))
							.setDescription(i18n('commands.new.response.max_tickets.description', settings.command_prefix, list.join('\n')))
							.setFooter(footer(settings.footer, i18n('message_will_be_deleted_in', 15)), message.author.iconURL());
						try {
							response = await message.author.send(embed);
						} catch {
							response = await message.channel.send(embed);
						}
					}
				} else {
					try {
						await this.client.tickets.create(message.guild.id, message.author.id, cat_row.id, message.cleanContent);
					} catch (error) {
						const embed = new MessageEmbed()
							.setColor(settings.error_colour)
							.setAuthor(message.author.username, message.author.displayAvatarURL())
							.setTitle(i18n('commands.new.response.error.title'))
							.setDescription(error.message)
							.setFooter(footer(settings.footer, i18n('message_will_be_deleted_in', 15)), message.guild.iconURL());
						try {
							response = await message.author.send(embed);
						} catch {
							response = await message.channel.send(embed);
						}
					}
				}

				if (response) {
					setTimeout(async () => {
						await response.delete();
					}, 15000);
				}
			}
		}

		this.client.commands.handle(message); // pass the message to the command handler
	}
};

