const config = require('../../user/config');

let current_presence = -1;

module.exports = {
	/**
	 * 
	 * @param {string} text 
	 * @param {string} [additional] 
	 * @returns {string}
	 */
	footer: (text, additional) => {
		if (text && additional) return `${text} | ${additional}`;
		else return text || additional || '';
	},
	/**
	 * Select a presence from the config
	 * @returns {PresenceData}
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