/* eslint-disable no-unused-vars */
const { Client } = require('discord.js');

const fs = require('fs');
const { join } = require('path');
const { path } = require('../../utils/fs');

/** A plugin */
module.exports = class Plugin {
	/**
	 * Create a new Plugin
	 * @param {Client} client The Discord Client
	 * @param {String} id The plugin ID
	 * @param {Object} options Plugin options
	 * @param {String} options.name A human-friendly name (can be different to the name in package.json)
	 */
	constructor(client, id, options = {}) {
		/** The human-friendly name of the plugin */
		this.name = options.name || id;
		
		/** The Discord Client */
		this.client = client;

		/** The PluginManager */
		this.manager = this.client.plugins;

		// Object.assign(this, this.manager.plugins.get(id));
		// make JSDoc happy

		let {
			version,
			author,
			description
		} = this.manager.plugins.get(id);

		/** The unique ID of the plugin (NPM package name) */
		this.id = id;

		/** The version of the plugin (NPM package version) */
		this.version = version;

		/** The plugin author's name (NPM package author) */
		this.author = author;

		/** The plugin description (NPM package description) */
		this.description = description;

		this.directory = {};
		
		/** A cleaned version of the plugin's ID suitable for use in the  directory name */
		this.directory.name = this.id.replace(/@[-_a-zA-Z0-9]+\//, '');

		/** The absolute path of the plugin directory */
		this.directory.path = path(`./user/plugins/${this.directory.name}`);
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
	 * The main function where your code should go. Create functions and event listeners here
	 */
	load() {}
};