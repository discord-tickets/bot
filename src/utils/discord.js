
const {
	Guild, // eslint-disable-line no-unused-vars
	GuildMember // eslint-disable-line no-unused-vars
} = require('discord.js');
const config = require('../../user/config');
let current_presence = -1;

module.exports = class DiscordUtils {
	constructor(client) {
		this.client = client;
	}

	/**
	 * Generate embed footer text
	 * @param {string} text
	 * @param {string} [additional]
	 * @returns {string}
	 */
	footer(text, additional) {
		if (text && additional) return `${text} | ${additional}`;
		else return additional || text || '';
	}

	/**
	 * Check if a guild member is staff
	 * @param {GuildMember} member - the guild member
	 * @returns {boolean}
	 */
	async isStaff(member) {
		const guild_categories = await this.client.db.models.Category.findAll({ where: { guild: member.guild.id } });
		return guild_categories.some(cat => cat.roles.some(r => member.roles.cache.has(r)));
	}

	/**
	 * get a guild's settings
	 * @param {Guild} guild - The Guild
	 * @returns {Promise<Model>}
	 */
	async getSettings(guild) {
		const data = { id: guild.id };
		const [settings] = await this.client.db.models.Guild.findOrCreate({
			defaults: data,
			where: data
		});
		return settings;
	}

	/**
	 * Delete a guild's settings
	 * @param {Guild} guild - The Guild
	 * @returns {Promise<Number>}
	 */
	async deleteSettings(guild) {
		const row = await this.getSettings(guild);
		return await row.destroy();
	}

	/**
	 * Select a presence from the config
	 * @returns {PresenceData}
	 */
	static selectPresence() {
		const length = config.presence.presences.length;
		if (length === 0) return {};

		let num;
		if (length === 1) {
			num = 0;
		} else if (config.presence.randomise) {
			num = Math.floor(Math.random() * length);
		} else {
			current_presence = current_presence + 1; // ++ doesn't work on negative numbers
			if (current_presence === length) {
				current_presence = 0;
			}
			num = current_presence;
		}

		const {
			activity: name,
			status,
			type,
			url
		} = config.presence.presences[num];

		return {
			activity: {
				name,
				type,
				url
			},
			status
		};
	}
};