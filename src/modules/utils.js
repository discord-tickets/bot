/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

module.exports = {
	/**
	 * @description Appends 's' to a word if plural number
	 * @param {string} word - singular version of word
	 * @param {number} num - integer
	 */
	plural(word, num) {
		return num !== 1 ? word + 's' : word;
	},

	isStaff(member) {
		let staff = false;

		member.client.config.staff_roles.forEach(id => {
			if (member.roles.cache.has(id))
				staff = true;
		});

		return staff;
	}
};