const {
	Command,
	OptionTypes
} = require('../modules/commands');

module.exports = class NewCommand extends Command {
	constructor(client) {
		super(client, {
			internal: true,
			name: 'new',
			description: 'Create a new ticket',
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

	async execute(data) {
		console.log(data.args);
		console.log(data.channel.name);
		console.log(data.member.user.tag);
		console.log(data.guild.name);
		console.log(data.token);
	}
};