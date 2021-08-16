const EventListener = require('../modules/listeners/listener');

const { MessageEmbed } = require('discord.js');
const { footer } = require('../utils/discord');

module.exports = class MessageReactionAddEventListener extends EventListener {
	constructor(client) {
		super(client, { event: 'messageReactionAdd' });
	}

	async execute(reaction, user) {

		if (reaction.partial) {
			try {
				await reaction.fetch();
			} catch (err) {
				return this.client.log.error(err);
			}
		}

		if (user.partial) {
			try {
				await user.fetch();
			} catch (err) {
				return this.client.log.error(err);
			}
		}

		if (user.id === this.client.user.id) return;

		const guild = reaction.message.guild;
		if (!guild) return;

		const settings = await this.client.utils.getSettings(guild);
		const i18n = this.client.i18n.getLocale(settings.locale);

		const channel = reaction.message.channel;
		const member = await guild.members.fetch(user.id);

		if (settings.blacklist.includes(user.id)) {
			return this.client.log.info(`Ignoring blacklisted member ${user.tag}`);
		} else {
			settings.blacklist.forEach(element => {
				if (guild.roles.cache.has(element) && member.roles.cache.has(element)) {
					return this.client.log.info(`Ignoring member ${user.tag} with blacklisted role`);
				}
			});
		}

		const t_row = await this.client.db.models.Ticket.findOne({ where: { id: channel.id } });

		if (t_row && t_row.opening_message === reaction.message.id) {
			if (reaction.emoji.name === '🙌' && await this.client.utils.isStaff(member)) {
				// ticket claiming

				await t_row.update({ claimed_by: member.user.id });

				await channel.updateOverwrite(member.user.id, { VIEW_CHANNEL: true }, `Ticket claimed by ${member.user.tag}`);

				const cat_row = await this.client.db.models.Category.findOne({ where: { id: t_row.category } });

				for (const role of cat_row.roles) {
					await channel.updateOverwrite(role, { VIEW_CHANNEL: false }, `Ticket claimed by ${member.user.tag}`);
				}

				this.client.log.info(`${member.user.tag} has claimed "${channel.name}" in "${guild.name}"`);

				await channel.send(
					new MessageEmbed()
						.setColor(settings.colour)
						.setAuthor(member.user.username, member.user.displayAvatarURL())
						.setTitle(i18n('ticket.claimed.title'))
						.setDescription(i18n('ticket.claimed.description', member.toString()))
						.setFooter(settings.footer, guild.iconURL())
				);
			} else {
				await reaction.users.remove(user.id);
			}
		} else {
			const p_row = await this.client.db.models.Panel.findOne({ where: { message: reaction.message.id } });

			if (p_row && typeof p_row.categories !== 'string') {
				// panels
				await reaction.users.remove(user.id);

				const category_id = p_row.categories[reaction.emoji.name];
				if (!category_id) return;

				const cat_row = await this.client.db.models.Category.findOne({ where: { id: category_id } });

				const tickets = await this.client.db.models.Ticket.findAndCountAll({
					where: {
						category: cat_row.id,
						creator: user.id,
						open: true
					}
				});

				let response;

				if (tickets.count >= cat_row.max_per_member) {
					if (cat_row.max_per_member === 1) {
						const embed = new MessageEmbed()
							.setColor(settings.error_colour)
							.setAuthor(user.username, user.displayAvatarURL())
							.setTitle(i18n('commands.new.response.has_a_ticket.title'))
							.setDescription(i18n('commands.new.response.has_a_ticket.description', tickets.rows[0].id))
							.setFooter(footer(settings.footer, i18n('message_will_be_deleted_in', 15)), guild.iconURL());
						try {
							response = await user.send(embed);
						} catch {
							response = await channel.send(embed);
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
							.setAuthor(user.username, user.displayAvatarURL())
							.setTitle(i18n('commands.new.response.max_tickets.title', tickets.count))
							.setDescription(i18n('commands.new.response.max_tickets.description', settings.command_prefix, list.join('\n')))
							.setFooter(footer(settings.footer, i18n('message_will_be_deleted_in', 15)), user.iconURL());
						try {
							response = await user.send(embed);
						} catch {
							response = await channel.send(embed);
						}
					}
				} else {
					try {
						await this.client.tickets.create(guild.id, user.id, cat_row.id);
					} catch (error) {
						const embed = new MessageEmbed()
							.setColor(settings.error_colour)
							.setAuthor(user.username, user.displayAvatarURL())
							.setTitle(i18n('commands.new.response.error.title'))
							.setDescription(error.message)
							.setFooter(footer(settings.footer, i18n('message_will_be_deleted_in', 15)), guild.iconURL());
						try {
							response = await user.send(embed);
						} catch {
							response = await channel.send(embed);
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

	}
};
