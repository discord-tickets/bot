const EventListener = require('../modules/listeners/listener');
const fetch = require('node-fetch');
const {
	MessageAttachment,
	MessageEmbed
} = require('discord.js');

module.exports = class MessageCreateEventListener extends EventListener {
	constructor(client) {
		super(client, { event: 'messageCreate' });
	}

	async execute(message) {
		if (!message.guild) return;

		const settings = await this.client.utils.getSettings(message.guild.id);
		const i18n = this.client.i18n.getLocale(settings.locale);

		const t_row = await this.client.db.models.Ticket.findOne({ where: { id: message.channel.id } });

		if (t_row) {
			const should_log_message = process.env.DB_TYPE.toLowerCase() !== 'sqlite' && settings.log_messages && !message.system;
			if (should_log_message) this.client.tickets.archives.addMessage(message); // add the message to the archives (if it is in a ticket channel)

			const ignore = [this.client.user.id, t_row.creator];
			if (!t_row.first_response && !ignore.includes(message.author.id)) t_row.first_response = new Date();

			t_row.last_message = new Date();
			await t_row.save();
		} else if (message.content.startsWith('tickets/')) {
			if (!message.member.permissions.has('MANAGE_GUILD')) return;

			const match = message.content.toLowerCase().match(/tickets\/(\w+)/i);

			if (!match) return;

			switch (match[1]) {
			case 'surveys': {
				const attachments = [...message.attachments.values()];
				if (attachments.length >= 1) {
					this.client.log.info(`Downloading surveys for "${message.guild.name}"`);
					const data = await (await fetch(attachments[0].url)).json();
					for (const survey in data) {
						const survey_data = {
							guild: message.guild.id,
							name: survey
						};
						const [s_row] = await this.client.db.models.Survey.findOrCreate({
							defaults: survey_data,
							where: survey_data
						});
						s_row.questions = data[survey];
						await s_row.save();
					}
					this.client.log.success(`Updated surveys for "${message.guild.name}"`);
					message.channel.send({ content: i18n('commands.settings.response.settings_updated') });
				} else {
					const surveys = await this.client.db.models.Survey.findAll({ where: { guild: message.guild.id } });
					const data = {};

					for (const survey in surveys) {
						const {
							name, questions
						} = surveys[survey];
						data[name] = questions;
					}

					const attachment = new MessageAttachment(
						Buffer.from(JSON.stringify(data, null, 2)),
						'surveys.json'
					);
					message.channel.send({ files: [attachment] });
				}
				break;
			}
			case 'tags': {
				const attachments = [...message.attachments.values()];
				if (attachments.length >= 1) {
					this.client.log.info(`Downloading tags for "${message.guild.name}"`);
					const data = await (await fetch(attachments[0].url)).json();
					settings.tags = data;
					await settings.save();
					this.client.log.success(`Updated tags for "${message.guild.name}"`);
					this.client.commands.publish(message.guild);
					message.channel.send({ content: i18n('commands.settings.response.settings_updated') });
				} else {
					const list = Object.keys(settings.tags).map(t => `❯ **\`${t}\`**`);
					const attachment = new MessageAttachment(
						Buffer.from(JSON.stringify(settings.tags, null, 2)),
						'tags.json'
					);
					return await message.channel.send({
						embeds: [
							new MessageEmbed()
								.setColor(settings.colour)
								.setTitle(i18n('commands.tag.response.list.title'))
								.setDescription(list.join('\n'))
								.setFooter(settings.footer, message.guild.iconURL())
						],
						files: [attachment]
					});
				}
				break;
			}
			}
		} else {
			if (message.author.bot) return;

			const p_row = await this.client.db.models.Panel.findOne({ where: { channel: message.channel.id } });

			if (p_row) {
				// handle message panels

				await message.delete();

				const cat_row = await this.client.db.models.Category.findOne({ where: { id: p_row.category } });

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
							.setFooter(this.client.utils.footer(settings.footer, i18n('message_will_be_deleted_in', 15)), message.guild.iconURL());
						try {
							response = await message.author.send({ embeds: [embed] });
						} catch {
							response = await message.channel.send({ embeds: [embed] });
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
							.setDescription(i18n('commands.new.response.max_tickets.description', list.join('\n')))
							.setFooter(this.client.utils.footer(settings.footer, i18n('message_will_be_deleted_in', 15)), message.author.iconURL());
						try {
							response = await message.author.send({ embeds: [embed] });
						} catch {
							response = await message.channel.send({ embeds: [embed] });
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
							.setFooter(this.client.utils.footer(settings.footer, i18n('message_will_be_deleted_in', 15)), message.guild.iconURL());
						try {
							response = await message.author.send({ embeds: [embed] });
						} catch {
							response = await message.channel.send({ embeds: [embed] });
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

