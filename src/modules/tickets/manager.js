const EventEmitter = require('events');
const TicketArchives = require('./archives');

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

		let guild = await this.client.guilds.cache.get(guild_id);
		let member = await guild.members.fetch(creator_id);
		let name = cat_row.name_format
			.replace(/{+\s?(user)?name\s?}+/gi, member.displayName)
			.replace(/{+\s?number\s?}+/gi, number);

		let t_channel = await guild.channels.create(name, {
			type: 'text',
			topic: `${member}${topic.length > 0 ? ` | ${topic}` : ''}`,
			parent: category_id,
			reason: `${member.tag} requested a new ticket channel`
		});

		await t_channel.updateOverwrite(creator_id, {
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
			topic
		});

		this.emit('create', t_row.id, creator_id);
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
	 */
	async close(ticket_id, closer_id, guild_id) {
		let t_row = await this.resolve(ticket_id, guild_id);
		if (!t_row) throw new Error(`Could not find a ticket with ID ${ticket_id}`);
		ticket_id = t_row.id;

		this.emit('beforeClose', ticket_id, closer_id);

		// ...

		this.emit('close', ticket_id, closer_id);
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
			ticket_id = t_row?.id;
		}

		let t_row = await this.client.db.models.Ticket.findOne({
			where: {
				id: ticket_id
			}
		});

		return t_row;
	}

};