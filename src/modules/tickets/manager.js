const EventEmitter = require('events');
const TicketArchives = require('./archives');
const { MessageEmbed } = require('discord.js');
const { int2hex } = require('../../utils');
const { footer } = require('../../utils/discord');

/** Manages tickets */
module.exports = class TicketManager extends EventEmitter {
	/**
	 * Create a TicketManager instance
	 * @param {Client} client
	 */
	constructor(client) {
		super();

		/** The Discord Client */
		this.client = client;

		this.setMaxListeners(this.client.config.max_listeners);

		this.archives = new TicketArchives(this.client);
	}

	/**
	 * Handle post-creation tasks
	 * @param {*} t_row 
	 * @param {*} cat_row 
	 */
	async postCreate(t_row, cat_row) {

		let guild = this.client.guilds.cache.get(cat_row.guild);
		let settings = await guild.settings;
		const i18n = this.client.i18n.get(settings.locale);
		let member = guild.members.cache.get(t_row.creator);
		let t_channel = this.client.channels.cache.get(t_row.id);

		let topic = t_row.topic
			? this.client.cryptr.decrypt(t_row.topic)
			: '';

		await t_channel.send(member.user.toString());

		if (cat_row.image) {
			await t_channel.send(cat_row.image);
		}

		let description = cat_row.opening_message
			.replace(/{+\s?(user)?name\s?}+/gi, member.displayName)
			.replace(/{+\s?(tag|ping|mention)?\s?}+/gi, member.user.toString());
		let embed = new MessageEmbed()
			.setColor(settings.colour)
			.setAuthor(member.user.username, member.user.displayAvatarURL())
			.setDescription(description)
			.setFooter(settings.footer);

		if (topic) embed.addField(i18n('commands.new.opening_message.fields.topic'), topic);

		let sent = await t_channel.send(embed);
		await sent.pin({ reason: 'Ticket opening message' });

		await t_row.update({
			opening_message: sent.id
		});

		let pinned = t_channel.messages.cache.last();

		if (pinned.system) {
			pinned
				.delete({ reason: 'Cleaning up system message' })
				.catch(() => this.client.log.warn('Failed to delete system pin message'));
		}

		let questions = cat_row.opening_questions
			.map((q, index) => `**${index + 1}.** ${q}`)
			.join('\n\n');

		if (cat_row.require_topic && topic.length === 0) {
			let collector_message = await t_channel.send(
				new MessageEmbed()
					.setColor(settings.colour)
					.setTitle('⚠️ ' + i18n('commands.new.request_topic.title'))
					.setDescription(i18n('commands.new.request_topic.description'))
					.setFooter(footer(settings.footer, i18n('collector_expires_in', 120)), guild.iconURL())
			);

			const collector_filter = (message) => message.author.id === t_row.creator;

			let collector = t_channel.createMessageCollector(collector_filter, {
				time: 120000
			});

			collector.on('collect', async (message) => {
				topic = message.content;
				await t_row.update({
					topic: this.client.cryptr.encrypt(topic)
				});
				await t_channel.setTopic(`${member} | ${topic}`, { reason: 'User updated ticket topic' });
				await sent.edit(
					new MessageEmbed()
						.setColor(settings.colour)
						.setAuthor(member.user.username, member.user.displayAvatarURL())
						.setDescription(description)
						.addField(i18n('commands.new.opening_message.fields.topic'), topic)
						.setFooter(settings.footer)
				);
				await message.react('✅');
				collector.stop();
			});

			collector.on('end', async () => {
				collector_message
					.delete()
					.catch(() => this.client.log.warn('Failed to delete topic collector message'));
				await t_channel.send(
					new MessageEmbed()
						.setColor(settings.colour)
						.setDescription(i18n('commands.new.questions', questions))
						.setFooter(settings.footer)
				);
			});
		} else {
			if (cat_row.opening_questions.length > 0) {
				await t_channel.send(
					new MessageEmbed()
						.setColor(settings.colour)
						.setDescription(i18n('commands.new.questions', questions))
						.setFooter(settings.footer)
				);
			}
		}
	}

	/**
	 * Create a new ticket
	 * @param {string} guild_id - ID of the guild to create the ticket in
	 * @param {string} creator_id - ID of the ticket creator (user)
	 * @param {string} category_id - ID of the ticket category
	 * @param {string} [topic] - The ticket topic 
	 */
	async create(guild_id, creator_id, category_id, topic) {
		if (!topic) topic = '';

		let cat_row = await this.client.db.models.Category.findOne({
			where: {
				id: category_id
			}
		});

		if (!cat_row)
			throw new Error('Ticket category does not exist');

		let number = (await this.client.db.models.Ticket.count({
			where: {
				guild: guild_id
			}
		})) + 1;

		let guild = this.client.guilds.cache.get(guild_id);
		let member = await guild.members.fetch(creator_id);
		let name = cat_row.name_format
			.replace(/{+\s?(user)?name\s?}+/gi, member.displayName)
			.replace(/{+\s?num(ber)?\s?}+/gi, number);

		let t_channel = await guild.channels.create(name, {
			type: 'text',
			topic: `${member}${topic.length > 0 ? ` | ${topic}` : ''}`,
			parent: category_id,
			reason: `${member.user.tag} requested a new ticket channel`
		});

		t_channel.updateOverwrite(creator_id, {
			VIEW_CHANNEL: true,
			READ_MESSAGE_HISTORY: true,
			SEND_MESSAGES: true,
			ATTACH_FILES: true
		}, `Ticket channel created by ${member.user.tag}`);

		let t_row = await this.client.db.models.Ticket.create({
			id: t_channel.id,
			number,
			guild: guild_id,
			category: category_id,
			creator: creator_id,
			topic: topic.length === 0 ? null : this.client.cryptr.encrypt(topic)
		});

		this.client.log.info(`${member.user.tag} created a new ticket in "${guild.name}"`);

		this.emit('create', t_row.id, creator_id);

		this.postCreate(t_row, cat_row);

		return t_row;
	}

	/**
	 * Get a ticket
	 * @param {(string|number)} ticket_id - The channel ID, or the ticket number
	 * @param {string} guild_id - The ID of the ticket's guild (used if a ticket number is provided instead of ID)
	 */
	async get(ticket_id, guild_id) {
		return await this.resolve(ticket_id, guild_id);
	}

	/**
	 * Close a ticket
	 * @param {(string|number)} ticket_id - The channel ID, or the ticket number
	 * @param {string?} closer_id - ID of the member who is closing the ticket, or null
	 * @param {string} [guild_id] - The ID of the ticket's guild (used if a ticket number is provided instead of ID)
	 * @param {string} [reason] - The reason for closing the ticket
	 */
	async close(ticket_id, closer_id, guild_id, reason) {
		let t_row = await this.resolve(ticket_id, guild_id);
		if (!t_row) throw new Error(`Could not find a ticket with ID ${ticket_id}`);
		ticket_id = t_row.id;

		this.emit('beforeClose', ticket_id);

		let guild = this.client.guilds.cache.get(t_row.guild);
		let settings = await guild.settings;
		const i18n = this.client.i18n.get(settings.locale);
		let channel = await this.client.channels.fetch(t_row.channel);

		if (closer_id) {
			let u_model_data = {
				user: closer_id,
				ticket: ticket_id
			};
			let [u_row] = await this.client.db.models.UserEntity.findOrCreate({
				where: u_model_data,
				defaults: u_model_data
			});

			let member = await guild.members.fetch(closer_id);

			await u_row.update({
				avatar: member.user.displayAvatarURL(),
				username: member.user.username,
				discriminator: member.user.discriminator,
				display_name: member.displayName,
				colour: member.displayColor === 0 ? null : int2hex(member.displayColor),
				bot: member.user.bot
			});

			if (channel) {
				let description = reason
					? i18n('commands.close.response.closed_by_member_with_reason.description', member.user.toString(), reason)
					: i18n('commands.close.response.closed_by_member.description', member.user.toString());
				await channel.send(
					new MessageEmbed()
						.setColor(settings.success_colour)
						.setAuthor(member.user.username, member.user.displayAvatarURL())
						.setTitle(i18n('commands.close.response.closed.title'))
						.setDescription(description)
						.setFooter(settings.footer)
				);

				setTimeout(async () => {
					await channel.delete(`Ticket channel closed by ${member.user.tag}${reason ? `: "${reason}"` : ''}`);
				}, 5000);
			}

			this.client.log.info(`${member.user.tag} closed a ticket (${ticket_id})${reason ? `: "${reason}"` : ''}`);
		} else {
			if (channel) {
				let description = reason
					? i18n('commands.close.response.closed_with_reason.description')
					: i18n('commands.close.response.closed.description');
				await channel.send(
					new MessageEmbed()
						.setColor(settings.success_colour)
						.setTitle(i18n('commands.close.response.closed.title'))
						.setDescription(description)
						.setFooter(settings.footer)
				);

				setTimeout(async () => {
					await channel.delete(`Ticket channel closed${reason ? `: "${reason}"` : ''}`);
				}, 5000);
			}

			this.client.log.info(`A ticket was closed (${ticket_id})${reason ? `: "${reason}"` : ''}`);

		}

		await t_row.update({
			open: false,
			closed_by: closer_id || null,
			closed_reason: reason || null
		});

		this.emit('close', ticket_id);
		return t_row;
	}

	/**
	 * 
	 * @param {(string|number)} ticket_id - ID or number of the ticket
	 * @param {string} [guild_id] - The ID of the ticket's guild (used if a ticket number is provided instead of ID)
	 */
	async resolve(ticket_id, guild_id) {
		if (!this.client.channels.resolve(ticket_id)) {
			let t_row = await this.client.db.models.Ticket.findOne({
				where: {
					number: ticket_id,
					guild_id
				}
			});
			if (!t_row) return null;
			ticket_id = t_row.id;
		}

		let t_row = await this.client.db.models.Ticket.findOne({
			where: {
				id: ticket_id
			}
		});

		return t_row;
	}

};