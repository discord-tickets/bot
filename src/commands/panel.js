const Command = require('../modules/commands/command');
const {
	Message, // eslint-disable-line no-unused-vars
	MessageEmbed
} = require('discord.js');
const {
	some, wait
} = require('../utils');
const { emojify } = require('node-emoji');

module.exports = class PanelCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			// options: [
			// 	{
			// 		alias: i18n('commands.panel.options.title.alias'),
			// 		description: i18n('commands.panel.options.title.description'),
			// 		example: i18n('commands.panel.options.title.example'),
			// 		name: i18n('commands.panel.options.title.name'),
			// 		required: false,
			// 		type: String
			// 	},
			// 	{
			// 		alias: i18n('commands.panel.options.description.alias'),
			// 		description: i18n('commands.panel.options.description.description'),
			// 		example: i18n('commands.panel.options.description.example'),
			// 		name: i18n('commands.panel.options.description.name'),
			// 		required: true,
			// 		type: String
			// 	},
			// 	{
			// 		alias: i18n('commands.panel.options.emoji.alias'),
			// 		description: i18n('commands.panel.options.emoji.description'),
			// 		example: i18n('commands.panel.options.emoji.example'),
			// 		multiple: true,
			// 		name: i18n('commands.panel.options.emoji.name'),
			// 		required: false,
			// 		type: String
			// 	},
			// 	{
			// 		alias: i18n('commands.panel.options.categories.alias'),
			// 		description: i18n('commands.panel.options.categories.description'),
			// 		example: i18n('commands.panel.options.categories.example'),
			// 		multiple: true,
			// 		name: i18n('commands.panel.options.categories.name'),
			// 		required: true,
			// 		type: String
			// 	}
			// ],
			description: i18n('commands.panel.description'),
			internal: true,
			name: i18n('commands.panel.name'),
			staff_only: true
		});
	}

	/**
	 * @param {Message} message
	 * @param {*} options
	 * @returns {Promise<void|any>}
	 */
	async execute(message, options) {
		// localised command and arg names are a pain
		const arg_title = this.options[0].name;
		const arg_description = this.options[1].name;
		const arg_emoji = this.options[2].name;
		const arg_categories = this.options[3].name;

		const settings = await this.client.utils.getSettings(message.guild);
		const i18n = this.client.i18n.getLocale(settings.locale);

		if (!options[arg_emoji]) options[arg_emoji] = [];

		options[arg_emoji] = options[arg_emoji].map(emoji => emojify(emoji.replace(/\\/g, '')));

		const invalid_category = await some(options[arg_categories], async id => {
			const cat_row = await this.client.db.models.Category.findOne({
				where: {
					guild: message.guild.id,
					id
				}
			});
			return !cat_row;
		});

		if (invalid_category) {
			return await message.channel.send({
				embeds: [
					new MessageEmbed()
						.setColor(settings.error_colour)
						.setTitle(i18n('commands.panel.response.invalid_category.title'))
						.setDescription(i18n('commands.panel.response.invalid_category.description'))
						.setFooter(settings.footer, message.guild.iconURL())
				]
			});
		}

		let panel_channel,
			panel_message;

		let categories_map = options[arg_categories][0];

		const embed = new MessageEmbed()
			.setColor(settings.colour)
			.setFooter(settings.footer, message.guild.iconURL());

		if (options[arg_title]) embed.setTitle(options[arg_title]);

		if (options[arg_emoji].length === 0) {
			// reaction-less panel
			panel_channel = await message.guild.channels.create('create-a-ticket', {
				permissionOverwrites: [
					{
						allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
						deny: ['ATTACH_FILES', 'EMBED_LINKS', 'ADD_REACTIONS'],
						id: message.guild.roles.everyone
					},
					{
						allow: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
						id: this.client.user.id
					}
				],
				position: 1,
				rateLimitPerUser: 30,
				reason: `${message.author.tag} created a new reaction-less panel`,
				type: 'GUILD_TEXT'
			});

			embed.setDescription(options[arg_description]);
			panel_message = await panel_channel.send({ embeds: [embed] });

			this.client.log.info(`${message.author.tag} has created a new reaction-less panel`);
		} else {
			if (options[arg_categories].length !== options[arg_emoji].length) {
				// send error
				return await message.channel.send({
					embeds: [
						new MessageEmbed()
							.setColor(settings.error_colour)
							.setTitle(i18n('commands.panel.response.mismatch.title'))
							.setDescription(i18n('commands.panel.response.mismatch.description'))
							.setFooter(settings.footer, message.guild.iconURL())
					]
				});
			} else {
				panel_channel = await message.guild.channels.create('create-a-ticket', {
					permissionOverwrites: [
						{
							allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'],
							deny: ['SEND_MESSAGES', 'ADD_REACTIONS'],
							id: message.guild.roles.everyone
						},
						{
							allow: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS'],
							id: this.client.user.id
						}
					],
					position: 1,
					reason: `${message.author.tag} created a new panel`,
					type: 'GUILD_TEXT'
				});

				if (options[arg_emoji].length === 1) {
					// single category
					categories_map = {};
					categories_map[options[arg_emoji][0]] = options[arg_categories][0];
					embed.setDescription(options[arg_description]);
					panel_message = await panel_channel.send({ embeds: [embed] });
					await panel_message.react(options[arg_emoji][0]);
				} else {
					// multi category
					let description = '';
					categories_map = {};

					for (const i in options[arg_emoji]) {
						categories_map[options[arg_emoji][i]] = options[arg_categories][i];
						const cat_row = await this.client.db.models.Category.findOne({
							where: {
								guild: message.guild.id,
								id: options[arg_categories][i]
							}
						});
						description += `\n> ${options[arg_emoji][i]} | ${cat_row.name}`;
					}

					embed.setDescription(options[arg_description] + '\n' + description);
					panel_message = await panel_channel.send({
						embeds: [
							embed
						]
					});

					for (const emoji of options[arg_emoji]) {
						await panel_message.react(emoji);
						await wait(1000); // 1 reaction per second rate-limit
					}

				}

				this.client.log.info(`${message.author.tag} has created a new panel`);
			}
		}

		message.channel.send({ content: `✅ ${panel_channel}` });

		await this.client.db.models.Panel.create({
			categories: categories_map,
			channel: panel_channel.id,
			guild: message.guild.id,
			message: panel_message.id
		});
	}
};
