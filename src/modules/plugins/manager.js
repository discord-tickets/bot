// eslint-disable-next-line no-unused-vars
const { Collection, Client } = require('discord.js');
// eslint-disable-next-line no-unused-vars
const Plugin = require('./plugin');

const fs = require('fs');
const { join } = require('path');
const { path } = require('../../utils/fs');

/** Manages the loading of plugins */
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
			'dsctickets.portal'
		];
	}

	/**
	 * Register and load a plugin
	 * @param {Boolean} npm Installed by NPM?
	 * @param {Plugin} Main The Plugin class
	 * @param {Object} pkg Contents of package.json
	 */
	registerPlugin(npm, Main, pkg) {
		let {
			name: id,
			version,
			author,
			description
		} = pkg;

		if (this.plugins.has(id)) {
			this.client.log.warn(`[PLUGINS] A plugin with the ID "${id}" is already loaded, skipping`);
			return;
		}

		if (typeof author === 'object') {
			author = author.name || 'unknown';
		}

		let loading = npm ? 'Loading' : 'Sideloading';

		this.client.log.plugins(`${loading} "${id}" v${version} by ${author}`);

		let about = {
			id,
			version,
			author,
			description
		};

		this.plugins.set(id, about);

		try {
			let plugin = new Main(this.client, id);
			plugin.load();

			this.plugins.set(id, Object.assign(about, {
				name: plugin.name || id,
			}));
			
		} catch (e) {
			if (npm) {
				this.client.log.warn(`An error occurred whilst loading "${id}"`);
			} else {
				this.client.log.warn(`An error occurred whilst sideloading "${id}"; have you manually installed its dependencies?`);
			}
			this.client.log.error(e);
			process.exit();
		}
	}

	/**
	 * Automatically register and load plugins
	 */
	load() {
		// normal plugins (NPM)
		this.client.config.plugins.forEach(plugin => {
			try {
				let pkg = require(`${plugin}/package.json`);
				let main = require(plugin);
				this.registerPlugin(true, main, pkg);
			} catch (e) {
				this.client.log.warn(`An error occurred whilst loading ${plugin}; have you installed it?`);
				this.client.log.error(e);
				process.exit();
			}
		});

		// sideload plugins for development
		const dirs = fs.readdirSync(path('./user/plugins'));
		dirs.forEach(dir => {
			if (!fs.existsSync(path(`./user/plugins/${dir}/package.json`))) return;
			let pkg = require(`../../../user/plugins/${dir}/package.json`);
			let main = require(join(`../../../user/plugins/${dir}/`, pkg.main));
			this.registerPlugin(false, main, pkg);
		});
	}

};