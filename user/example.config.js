/**
 * ###############################################################################################
 *  ____                                        _     _____              _             _
 * |  _ \  (_)  ___    ___    ___    _ __    __| |   |_   _| (_)   ___  | | __   ___  | |_   ___
 * | | | | | | / __|  / __|  / _ \  | '__|  / _` |     | |   | |  / __| | |/ /  / _ \ | __| / __|
 * | |_| | | | \__ \ | (__  | (_) | | |    | (_| |     | |   | | | (__  |   <  |  __/ | |_  \__ \
 * |____/  |_| |___/  \___|  \___/  |_|     \__,_|     |_|   |_|  \___| |_|\_\  \___|  \__| |___/
 *
 * ---------------------
 *      Quick Start
 * ---------------------
 *
 * 	> For detailed instructions, visit the documentation: https://eartharoid.github.io/discordtickets
 *
 * ---------------------
 *       Support
 * ---------------------
 *
 * 	> Discord support server: https://go.eartharoid.me/discord
 * 	> Wiki: https://eartharoid.github.io/discordtickets
 *
 * ###############################################################################################
 */

module.exports = {
	portal: {
		enabled: false,
		host: 'https://tickets.example.com'
	},
	presences: [
		{
			activity: '/new | /help',
			type: 'PLAYING'
		},
		{
			activity: 'with tickets | /help',
			type: 'PLAYING'
		},
		{
			activity: 'for new tickets | /help',
			type: 'WATCHING'
		},
	],
	defaults: {
		colour: '#009999',
		locale: 'en-GB'
	},
	logs: {
		enabled: true,
		keep_for: 30
	},
	debug: false,
	update_notice: true,
};