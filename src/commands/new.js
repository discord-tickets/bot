const { MessageEmbed } = require('discord.js');
const {
	Command,
	OptionTypes
} = require('../modules/commands');

module.exports = class NewCommand extends Command {
	constructor(client) {
		super(client, {
			internal: true,
			name: 'new',
			description: 'Create a new support ticket',
			options: [
				// {
				// 	name: 'category',
				// 	type: OptionTypes.STRING,
				//	description: 'The category you would like to create a new ticket for',
				// 	required: true,
				// },
				{
					name: 'topic',
					type: OptionTypes.STRING,
					description: 'The topic of the ticket',
					required: false,
				}
			]
		});
	}

	async execute({ guild, member, channel, args}, interaction) {
		console.log(args);
		// console.log(channel.name);
		// console.log(member.user.tag);
		// console.log(guild.name);

		const i18n = this.client.i18n.get(/* GET GUILD LOCALE FROM SETTINGS */);

		return new MessageEmbed()
			.setTitle(i18n('bot.version', require('../../package.json').version));
	}
};