/**
 * ###############################################################################################
 *  ____                                        _     _____              _             _
 * |  _ \  (_)  ___    ___    ___    _ __    __| |   |_   _| (_)   ___  | | __   ___  | |_   ___
 * | | | | | | / __|  / __|  / _ \  | '__|  / _` |     | |   | |  / __| | |/ /  / _ \ | __| / __|
 * | |_| | | | \__ \ | (__  | (_) | | |    | (_| |     | |   | | | (__  |   <  |  __/ | |_  \__ \
 * |____/  |_| |___/  \___|  \___/  |_|     \__,_|     |_|   |_|  \___| |_|\_\  \___|  \__| |___/
 *
 * ---------------------
 *       Support
 * ---------------------
 *
 * 	> Documentation: https://discordtickets.app
 * 	> Discord support server: https://go.eartharoid.me/discord
 *
 * ###############################################################################################
 */

const prefix = '-';

module.exports = {
	debug: false,
	defaults: {
		colour: '#009999',
		command_prefix: prefix,
		log_messages: true,
		name_format: 'ticket-{number}',
		opening_message: 'Hello {name}, thank you for creating a ticket. A member of staff will soon be available to assist you.\n\n__All messages in this channel are stored for future reference.__',
		opening_thumb: 'https://images-na.ssl-images-amazon.com/images/I/510aAFZFu6L.png'
	},
	locale: 'en-GB',
	logs: {
		enabled: true,
		keep_for: 30,
		split: true
	},
	max_listeners: 10,
	plugins: [],
	presence: {
		duration: 60,
		presences: [
			{
				activity: `${prefix}new`,
				type: 'PLAYING'
			},
			{
				activity: 'with tickets',
				type: 'PLAYING'
			},
			{
				activity: 'tickets',
				type: 'WATCHING'
			}
		],
		randomise: true
	},
	super_secret_setting: true,
	update_notice: true
};