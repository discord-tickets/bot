/* eslint-disable no-unused-vars */
const { Client } = require('discord.js');
const Command = require('../commands/command');
const fs = require('fs');
const { join } = require('path');
const { path } = require('../../utils/fs');

/**
 * A plugin
 */
module.exports = class Plugin {
	/**
	 * Create a new Plugin
	 * @param {Client} client The Discord Client
	 * @param {String} id The plugin ID
	 * @param {Object} options Plugin options
	 * @param {String} options.name A human-friendly name (can be different to the name in package.json)
	 * @param {String[]} options.commands An array of command names the plugin registers
	 */
	constructor(client, about, options = {}) {
		/** The Discord Client */
		this.client = client;

		/** The PluginManager */
		this.manager = this.client.plugins;

		/** An official plugin? */
		this.official = this.manager.official.includes(this.id);

		let {
			id,
			version,
			author,
			description
		} = about;

		/**
		 * The human-friendly name of the plugin
		 * @type {string}
		 */
		this.name = options.name ?? id;

		/** 
		 * An array of commands from this plugin
		 * @type {string[]}
		 */
		this.commands = options.commands;

		/** 
		 * The unique ID of the plugin (NPM package name)
		 * @type {string}
		 */
		this.id = id;

		/** 
		 * The version of the plugin (NPM package version)
		 * @type {string}
		 */
		this.version = version;

		/** 
		 * The plugin author's name (NPM package author)
		 * @type {(undefined|string)}
		 */
		this.author = author;

		/** 
		 * The plugin description (NPM package description)
		 * @type {string}
		 */
		this.description = description;

		let clean = this.id.replace(/@[-_a-zA-Z0-9]+\//, '');

		/**
		 * Information about the plugin directory
		 * @property {string} name - A cleaned version of the plugin's ID suitable for use in the directory name
		 * @property {string} path - The absolute path of the plugin directory
		 */
		this.directory = {
			name: clean,
			path: path(`./user/plugins/${clean}`)
		};
	}

	/**
	 * Create the plugin directory if it doesn't already exist
	 * @returns {Boolean} True if created, false if it already existed
	 */
	createDirectory() {
		if (!fs.existsSync(this.directory.path)) {
			this.client.log.plugins(`Creating plugin directory for "${this.name}"`);
			fs.mkdirSync(this.directory.path);
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Create the plugin config file if it doesn't already exist
	 * @param {Object} template The default config template
	 * @returns {Boolean} True if created, false if it already existed
	 */
	createConfig(template) {
		this.createDirectory();
		let file = join(this.directory.path, 'config.json');
		if (!fs.existsSync(file)) {
			this.client.log.plugins(`Creating plugin config file for "${this.name}"`);
			fs.writeFileSync(file, JSON.stringify(template, null, 2));
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Reset the plugin config file to the defaults
	 * @param {Object} template The default config template
	 */
	resetConfig(template) {
		this.createDirectory();
		let file = join(this.directory.path, 'config.json');
		this.client.log.plugins(`Resetting plugin config file for "${this.name}"`);
		fs.writeFileSync(file, JSON.stringify(template, null, 2));
	}

	/**
	 * The function where any code that needs to be executed before the client is ready should go.
	 * **This is executed _BEFORE_ the ready event**
	 * @abstract
	 */
	preload() { }

	/**
	 * The main function where your code should go. Create commands and event listeners here.
	 * **This is executed _after_ the ready event**
	 * @abstract
	 */
	load() {}
};