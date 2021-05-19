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
 * 	> For detailed instructions, visit the GitHub repository and read the documentation:
 * 	https://github.com/eartharoid/DiscordTickets/wiki
 *
 * 	> IMPORTANT: Also edit the TOKEN in 'user/.env'
 *
 * ---------------------
 *       Support
 * ---------------------
 *
 * 	> Information: https://github.com/eartharoid/DiscordTickets/#readme
 * 	> Discord Support Server: https://go.eartharoid.me/discord
 * 	> Wiki: https://github.com/eartharoid/DiscordTickets/wiki
 *
 * ###############################################################################################
 */

module.exports = {
	prefix: '?',
	name: 'DiscordTickets',
	presences: [
		{
			activity: '%snew',
			type: 'PLAYING'
		},
		{
			activity: 'with tickets',
			type: 'PLAYING'
		},
		{
			activity: 'for new tickets',
			type: 'WATCHING'
		}
	],
	append_presence: ' | %shelp',
	colour: '#1ec45c',
	err_colour: 'RED',
	cooldown: 3,
	guild: '834290682243317820', // ID of your guild (REQUIRED)
	staff_role: '842088216059838485', // ID of your Support Team role (REQUIRED)

	tickets: {
		category: '844114081513340928', // ID of your tickets category (REQUIRED)
		send_img: false,
		text: `Please complete the following to proceed with interview: \n1.Change discord name to match in-game name.\n2. Where did you find us?\n3.Post profile & home base with builder selection drop down.\n4.Post location/time zone.\n5.Post player tag!`,
		pin: false,
		max: 1,
		default_topic: {
			
		}
	},

	commands: {
		close: {
			confirmation: true,
			send_transcripts: true
		},
		delete: {
			confirmation: true
		},
		new: {
			enabled: true
		},
		closeall: {
			enabled: true,
		},
	},

	transcripts: {
		html: {
			enabled: true,
			keep_for:365,
		},
		web: {
			enabled: false,
			server: 'https://tickets.example.com',
		},
		channel: '844239451416690700' // ID of your archives channel
	},

	panel: {
		title: 'Applications',
		description: 'Interested in joining the Wookie Force? React below to create an interview.',
		reaction: '🧾'
	},

	storage: {
		type: 'sqlite'
	},

	logs: {
		files: {
			enabled: true,
			keep_for: 365
		},
		discord: {
			enabled: false,
			channel: '' // ID of your log channel
		}
	},

	debug: false,
	updater: true
};
