
const { GuildMember } = require('discord.js'); // eslint-disable-line no-unused-vars
const { Model } = require('sequelize'); // eslint-disable-line no-unused-vars
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
	 * Fet a guild's settings
	 * @param {string} id - The guild's ID
	 * @returns {Promise<Model>}
	 */
	async getSettings(id) {
		const data = { id };
		const [settings] = await this.client.db.models.Guild.findOrCreate({
			defaults: data,
			where: data
		});
		return settings;
	}

	/**
	 * Delete a guild's settings
	 * @param {string} id - The guild ID
	 * @returns {Promise<Number>}
	 */
	async deleteSettings(id) {
		const row = await this.getSettings(id);
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
			activities: [
				{
					name,
					type,
					url
				}
			],
			status
		};
	}
};