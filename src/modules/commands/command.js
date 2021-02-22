/* eslint-disable no-unused-vars */
const { Client, GuildMember, Guild, Channel } = require('discord.js');

const fs = require('fs');
const { join } = require('path');
const { path } = require('../../utils/fs');
const { createMessage, flags } = require('../../utils/discord');
const Plugin = require('../plugins/plugin');

/**
 * A command
 */
module.exports = class Command {
	/**
	   * A command option choice
	   * @typedef CommandOptionChoice
	 * @property {string} name - Choice name (1-100)
	 * @property {(string|number)} value - choice value
	   */

	/**
	 * A command option
	 * @typedef CommandOption
	 * @property {number} type - [ApplicationCommandOptionType](https://discord.com/developers/docs/interactions/slash-commands#applicationcommandoptiontype)
	 * @property {string} name - Option name (1-32)
	 * @property {string} description - Option description (1-100)
	 * @property {boolean} [required] - Required?
	 * @property {CommandOptionChoice[]} [choices] - Array of choices
	 * @property {CommandOption[]} [options] - Array of options if this option is a subcommand/subcommand group
	 */

	/**
	 * Create a new Command
	 * @param {Client} client - The Discord Client
	 * @param {Object} data - Command data
	 * @param {string} data.name - The name of the command (3-32)
	 * @param {string} data.description - The description of the command (1-100)
	 * @param {boolean} [data.staff_only] - Only allow staff to use this command?
	 * @param {string[]} [data.permissions] - Array of permissions needed for a user to use this command
	 * @param {boolean} [data.global] - Create a global command?
	 * @param {CommandOption[]} [data.options] - The command options (parameters), max of 10
	 */
	constructor(client, data) {

		/** The Discord Client */
		this.client = client;

		/** The CommandManager */
		this.manager = this.client.commands;

		if (typeof data !== 'object') {
			throw new TypeError(`Expected type of data to be an object, got ${typeof data}`);
		}

		/**
		 * The name of the command 
		 * @type {string}
		 */
		this.name = data.name;

		/**
		 * The command description
		 * @type {string}
		*/
		this.description = data.description;

		/**
		 * Only allow staff to use this command?
		 * @type {boolean}
		*/
		this.staff_only = data.staff_only;

		/**
		 * Array of permissions needed for a user to use this command
		 * @type {string[]}
		*/
		this.permissions = data.permissions;

		/**
		 * Is this a global command?
		 * @type {boolean}
		 * @default true
		*/
		this.global = data.global === false ? false : true;

		/** 
		 * The command options
		 * @type {CommandOption[]}
		 */
		this.options = data.options;

		/**
		 * True if command is internal, false if it is from a plugin
		 * @type {boolean}
		 */
		this.internal = data.internal;

		if (!this.internal) {
			/**
			 * The plugin this command belongs to, if any
			 * @type {(undefined|Plugin)}
			 */
			this.plugin = this.client.plugins.plugins.find(p => p.commands?.includes(this.name));
		}	

		this.manager.check(data); // validate

		try {
			this.manager.register(this); // register the command
		} catch (e) {
			return this.client.log.error(e);
		}

		if (this.global)
			this.client.api.applications(this.client.user.id).commands.post({ data }); // post command to Discord

		let internal = this.internal ? 'internal ' : '';
		this.client.log.commands(`Loaded ${internal}"${this.name}" command`);

	}

	/**
	 * [ApplicationCommandInteractionDataOption](https://discord.com/developers/docs/interactions/slash-commands#interaction-applicationcommandinteractiondataoption)
	 * @typedef {Object} ApplicationCommandInteractionDataOption
	 * @property {string} name - Name of the parameter
	 * @property {*} value - The value
	 * @property {(undefined|ApplicationCommandInteractionDataOption[])} options - Present if the option is a subcommand/subcommand group
	 */

	/**
	 * [Interaction](https://discord.com/developers/docs/interactions/slash-commands#interaction) object
	 * @typedef {Object} Interaction
	 * @property {string} interaction.id - ID of the interaction
	 * @property {number} interaction.type - Type of interaction
	 * @property {ApplicationCommandInteractionData} interaction.data - Interaction data
	 * @property {Object} interaction.guild- The guild object
	 * @property {Object} interaction.channel- The channel object
	 * @property {Object} interaction.member - The member object
	 * @property {string} interaction.token - The token used to respond to the interaction
	 */

	/**
	 * The code to be executed when a command is invoked
	 * @abstract
	 * @param {Object} data - Object containing data about the command invocation
	 * @param {Object} data.args - Command arguments
	 * @param {Channel} data.channel- The channel object
	 * @param {Guild} data.guild- The guild object
	 * @param {GuildMember} data.member - The member object
	 * @param {Interaction} interaction - Interaction object
	 */
	async execute(data, interaction) { }

	/**
	 * Defer the response to respond later
	 * @param {Interaction} interaction - Interaction object 
	 * @param {boolean} secret - Ephemeral?
	 */
	async acknowledge(interaction, secret) {
		this.client.api.interactions(interaction.id, interaction.token).callback.post({
			data: {
				type: 5,
				// data: {
				// 	flags: flags(secret)
				// },
			}
		});
	}

	/**
	 * Send an interaction response
	 * @param {Interaction} interaction - Interaction object
	 * @param {*} content - Message content
	 * @param {boolean} secret - Ephemeral message? **NOTE: EMBEDS AND ATTACHMENTS DO NOT RENDER IF TRUE**
	 */
	async sendResponse(interaction, content, secret) {
		const send = this.client.api.webhooks(this.client.fetchApplication().id, interaction.token).messages['@original'].patch;
		if (typeof content === 'object')
			send({
				data: {
					type: 4,
					data: {
						flags: flags(secret),
						...await createMessage(this.client, interaction.channel_id, content)
					}
				}
			});
		else if (typeof content === 'string')
			send({
				data: {
					type: 4,
					data: {
						flags: flags(secret),
						content
					}
				}
			});	
	}

	/**
	 * Edit the original interaction response
	 * @param {Interaction} interaction - Interaction object
	 * @param {*} content - Message content
	 */
	async editResponse(interaction, content) {
		if (typeof content === 'object')
			this.client.api.interactions(interaction.id, interaction.token).messages.patch({
				embeds: content
			});
		else
			this.client.api.interactions(interaction.id, interaction.token).messages.patch({
				content
			});
	}
};