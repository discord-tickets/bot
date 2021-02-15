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
	storage: {
		type: 'sqlite'
	},
	portal: {
		enabled: false,
		host: 'https://tickets.example.com'
	},
	presences: [
		{
			activity: '%snew | %shelp',
			type: 'PLAYING'
		},
		{
			activity: 'with tickets | %shelp',
			type: 'PLAYING'
		},
		{
			activity: 'for new tickets | %shelp',
			type: 'WATCHING'
		}
	],
	defaults: {
		prefix: '-',
		colour: '#009999',
	},
	logs: {
		enabled: true,
		keep_for: 30
	},
	debug: false,
	update_notice: true,
};