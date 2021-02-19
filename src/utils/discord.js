const Discord = require('discord.js');

const config = require('../../user/config');

let current_presence = -1;

module.exports = {
	/**
	 * Resolves data and files so embeds can be sent as a response to a slash command
	 * @param {Discord.Client} channel_id - Text channel ID
	 * @param {string} channel_id - Text channel ID
	 * @param {*} content - Message content 
	 * @returns {Object}
	 */
	createMessage: async (client, channel_id, content) => {
		let msg = await Discord.APIMessage.create(client.channels.resolve(channel_id), content)
			.resolveData()
			.resolveFiles();
		return { ...msg.data, files: msg.files };
	},

	/**
	 * Generate flags
	 * @param {boolean} secret - Ephemeral message?
	 */
	flags: (secret) => secret ? 1 << 64 : undefined,

	/**
	 * Select a presence from the config
	 * @returns {Discord.PresenceData}
	 */
	selectPresence: () => {
		let length = config.presence.presences.length;
		if (length === 0) return {};
		
		let num;
		if (length === 1)
			num = 0;
		else if (config.presence.randomise)
			num = Math.floor(Math.random() * length);
		else {
			current_presence = current_presence + 1; // ++ doesn't work on negative numbers
			if (current_presence === length)
				current_presence = 0;
			num = current_presence;
		}

		let {
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
	},
};