// eslint-disable-next-line no-unused-vars
const { Collection, Client } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Plugin = require('./plugin');

/**
 * Manages the loading of plugins
 */
module.exports = class PluginManager {
	/**
	 * Create a PluginManager instance
	 * @param {Client} client 
	 */
	constructor(client) {
		/** The Discord Client */
		this.client = client;
		
		/** A discord.js Collection (Map) of loaded plugins */
		this.plugins = new Collection();

		/** Array of official plugins to be used to check if a plugin is official */
		this.official = [
			'dsctickets.settings-server',
			'dsctickets.portal'
		];
	}

	handleError(id) {
		if (!this.official.includes(id))
			this.client.log.notice(`"${id}" is NOT an official plugin, please do not ask for help with it in the Discord Tickets support server, seek help from the plugin author instead.`);
	}

	/**
	 * Register and load a plugin
	 * @param {Plugin} plugin - the Plugin class
	 * @param {Object} pkg - contents of package.json
	 */
	register(plugin, pkg) {
		let {
			name: id,
			version,
			author,
			description
		} = pkg;

		if (this.plugins.has(id)) {
			this.client.log.warn(`(PLUGINS) A plugin with the ID "${id}" is already loaded, skipping`);
			return;
		}

		if (typeof author === 'object') {
			author = author.name ?? 'unknown';
		}

		let about = {
			id,
			version,
			author,
			description
		};

		try {
			plugin = new (plugin(Plugin))(this.client, about);
			this.plugins.set(id, plugin);
			this.client.log.plugins(`Loading "${plugin.name}" v${version} by ${author}`);
			plugin.preload();	
		} catch (e) {
			this.handleError(id);
			this.client.log.warn(`An error occurred whilst loading the "${id}" plugin`);
			this.client.log.error(e);
			process.exit();
		}
	}

	/** Automatically register and load plugins */
	load() {
		this.client.config.plugins.forEach(plugin => {
			try {
				let main = require(plugin);
				let pkg = require(`${plugin}/package.json`);
				this.register(main, pkg);
			} catch (e) {
				this.handleError(plugin);
				this.client.log.warn(`An error occurred whilst loading ${plugin}; have you installed it?`);
				this.client.log.error(e);
				process.exit();
			}
		});
	}

};