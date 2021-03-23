const EventEmitter = require('events');
// eslint-disable-next-line no-unused-vars
const { Client } = require('discord.js');

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
	}

	/**
	 * Create a new ticket
	 * @param {string} guild - ID of the guild to create the ticket in
	 * @param {string} creator - ID of the ticket creator (user)
	 * @param {string} category - ID of the ticket category
	 * @param {string} [topic] - The ticket topic 
	 */
	async create(guild, creator, category, topic) {

	}

	/**
	 * Get a ticket
	 * @param {string} ticket - The channel ID, or the ticket number
	 */
	async get(ticket) {

	}

	/**
	 * Close a ticket
	 * @param {string} ticket - The channel ID, or the ticket number
	 * @param {string} [closer] - ID of the member who is closing the ticket
	 */
	async close(ticket, closer) {
		if (!this.client.channels.resolve(ticket)) {
			let row = await this.client.db.Models.Ticket.findOne({
				where: {
					number: ticket
				}
			});
			if (!row) throw new Error(`Could not find a ticket with number ${ticket}`);
			ticket = row.id;
		}
			
		let row = await this.client.db.Models.Ticket.findOne({
			where: {
				id: ticket
			}
		});

		if (!row) throw new Error(`Could not find a ticket with ID ${ticket}`);

		this.emit('beforeClose', ticket, closer);

		/**
		 * 
		 * 
		 * for each message in table, create entities
		 * 
		 * 
		 */
	}

};