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
	 */
	async close(ticket) {

	}

	/**
	 * Close multiple tickets
	 * @param {string[]} tickets - An array of channel IDs to close **(does not accept ticket numbers)**
	 */
	async closeMultiple(tickets) {

	}
};