const Command = require('../modules/commands/command');
const { MessageEmbed } = require('discord.js');

module.exports = class PanelCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			internal: true,
			name: i18n('commands.panel.name'),
			description: i18n('commands.panel.description'),
			aliases: [],
			process_args: true,
			args: [
				{
					name: i18n('commands.panel.args.title.name'),
					description: i18n('commands.panel.args.title.description'),
					example: i18n('commands.panel.args.title.example'),
					required: false,
					// for arg parsing
					alias: i18n('commands.panel.args.title.alias'),
					type: String
				},
				{
					name: i18n('commands.panel.args.description.name'),
					description: i18n('commands.panel.args.description.description'),
					example: i18n('commands.panel.args.description.example'),
					required: true,
					// for arg parsing
					alias: i18n('commands.panel.args.description.alias'),
					type: String
				},
				{
					name: i18n('commands.panel.args.emoji.name'),
					description: i18n('commands.panel.args.emoji.description'),
					example: i18n('commands.panel.args.emoji.example'),
					required: false,
					// for arg parsing
					alias: i18n('commands.panel.args.emoji.alias'),
					type: String,
					multiple: true,
				},
				{
					name: i18n('commands.panel.args.category.name'),
					description: i18n('commands.panel.args.category.description'),
					example: i18n('commands.panel.args.category.example'),
					required: true,
					// for arg parsing
					alias: i18n('commands.panel.args.category.alias'),
					type: String,
					multiple: true,
				}
			],
			permissions: ['MANAGE_GUILD']
		});
	}

	async execute(message, args) {

		const arg_title = this.args[0].name;
		const arg_description = this.args[1].name;
		const arg_emoji = this.args[2].name;
		const arg_category = this.args[3].name;

		let settings = await message.guild.settings;
		const i18n = this.client.i18n.getLocale(settings.locale);

		console.log(args)
		message.channel.send(Object.keys(args).map(arg => `${arg}: \`${args[arg]}\``).join('\n'))

		if (!args[arg_emoji]) {
			// reaction-less panel
		} else {
			if (!args[arg_category] || args[arg_category].length !== args[arg_emoji.length]) {
				// send error
			} else {
				if (args[arg_emoji].length === 1) {
					// single category
				} else {
					// multi category
				}
			}
		}

	}
};