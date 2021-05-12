const Command = require('../modules/commands/command');
const { MessageEmbed } = require('discord.js');
const { some, wait } = require('../utils');
const { emojify } = require('node-emoji');

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
					name: i18n('commands.panel.args.categories.name'),
					description: i18n('commands.panel.args.categories.description'),
					example: i18n('commands.panel.args.categories.example'),
					required: true,
					// for arg parsing
					alias: i18n('commands.panel.args.categories.alias'),
					type: String,
					multiple: true,
				}
			],
			permissions: ['MANAGE_GUILD']
		});
	}

	async execute(message, args) {
		// localised command and arg names are a pain
		const arg_title = this.args[0].name;
		const arg_description = this.args[1].name;
		const arg_emoji = this.args[2].name;
		const arg_categories = this.args[3].name;

		let settings = await message.guild.settings;
		const i18n = this.client.i18n.getLocale(settings.locale);

		if (!args[arg_emoji])
			args[arg_emoji] = [];
		
		args[arg_emoji] = args[arg_emoji].map(emoji => emojify(emoji.replace(/\\/g, '')));

		const invalid_category = await some(args[arg_categories], async id => {
			let cat_row = await this.client.db.models.Category.findOne({
				where: {
					id: id,
					guild: message.guild.id
				}
			});
			return !cat_row;
		});
		
		if (invalid_category) {
			return await message.channel.send(
				new MessageEmbed()
					.setColor(settings.error_colour)
					.setTitle(i18n('commands.panel.response.invalid_category.title'))
					.setDescription(i18n('commands.panel.response.invalid_category.description'))
					.setFooter(settings.footer, message.guild.iconURL())
			);
		}

		let panel_channel,
			panel_message;
		
		let categories_map = args[arg_categories][0];
		
		let embed = new MessageEmbed()
			.setColor(settings.colour)
			.setFooter(settings.footer, message.guild.iconURL());
		
		if (args[arg_title])
			embed.setTitle(args[arg_title]);

		if (args[arg_emoji].length === 0) {
			// reaction-less panel
			panel_channel = await message.guild.channels.create('create-a-ticket', {
				type: 'text',
				rateLimitPerUser: 30,
				permissionOverwrites: [
					{
						id: message.guild.roles.everyone,
						allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
						deny: ['ATTACH_FILES', 'EMBED_LINKS', 'ADD_REACTIONS']
					},
					{
						id: this.client.user.id,
						allow: ['EMBED_LINKS']
					}
				],
				position: 1,
				reason: `${message.author.tag} created a new reaction-less panel`
			});
			
			embed.setDescription(args[arg_description]);
			panel_message = await panel_channel.send(embed);

			this.client.log.info(`${message.author.tag} has created a new reaction-less panel`);
		} else {
			if (args[arg_categories].length !== args[arg_emoji].length) {
				// send error
				return await message.channel.send(
					new MessageEmbed()
						.setColor(settings.error_colour)
						.setTitle(i18n('commands.panel.response.mismatch.title'))
						.setDescription(i18n('commands.panel.response.mismatch.description'))
						.setFooter(settings.footer, message.guild.iconURL())
				);
			} else {
				panel_channel = await message.guild.channels.create('create-a-ticket', {
					type: 'text',
					permissionOverwrites: [
						{
							id: message.guild.roles.everyone,
							allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
							deny: ['SEND_MESSAGES', 'ADD_REACTIONS']
						},
						{
							id: this.client.user.id,
							allow: ['SEND_MESSAGES', 'EMBED_LINKS']
						}
					],
					position: 1,
					reason: `${message.author.tag} created a new panel`
				});

				if (args[arg_emoji].length === 1) {
					// single category
					categories_map = {};
					categories_map[args[arg_emoji][0]] = args[arg_categories][0];
					embed.setDescription(args[arg_description]);
					panel_message = await panel_channel.send(embed);
					await panel_message.react(args[arg_emoji][0]);
				} else {
					// multi category
					let description = '';
					categories_map = {};
					
					for (let i in args[arg_emoji]) {
						categories_map[args[arg_emoji][i]] = args[arg_categories][i];
						let cat_row = await this.client.db.models.Category.findOne({
							where: {
								id: args[arg_categories][i],
								guild: message.guild.id
							}
						});
						description += `\n> ${args[arg_emoji][i]} | ${cat_row.name}`;
					}

					embed.setDescription(args[arg_description] + '\n' + description);
					panel_message = await panel_channel.send(embed);

					for (let emoji of args[arg_emoji]) {
						await panel_message.react(emoji);
						await wait(1000); // 1 reaction per second rate-limit
					}
	
				}

				this.client.log.info(`${message.author.tag} has created a new panel`);
			}
		}

		message.channel.send(`✅ ${panel_channel}`);

		await this.client.db.models.Panel.create({
			categories: categories_map,
			channel: panel_channel.id,
			guild: message.guild.id,
			message: panel_message.id,
		});
	}
};