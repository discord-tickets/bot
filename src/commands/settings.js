const Command = require('../modules/commands/command');
const fetch = require('node-fetch');
const { MessageAttachment } = require('discord.js');

module.exports = class SettingsCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.get(client.config.locale);
		super(client, {
			internal: true,
			name: i18n('commands.settings.name'),
			description: i18n('commands.settings.description'),
			permissions: ['MANAGE_GUILD']
		});
	}

	async execute(message) {

		let settings = await message.guild.settings;
		const i18n = this.client.i18n.get(settings.locale);

		let attachments = [ ...message.attachments.values() ];

		if (attachments.length >= 1) {

			// load settings from json
			this.client.log.info(`Downloading settings for "${message.guild.name}"`);
			let data = await (await fetch(attachments[0].url)).json();
			settings.colour = data.colour;
			settings.command_prefix = data.command_prefix;
			settings.error_colour = data.error_colour;
			settings.locale = data.locale;
			settings.log_messages = data.log_messages;
			settings.success_colour = data.success_colour;
			await settings.save();

			for (let c of data.categories) {
				if (c.id) {

					// existing category
					let category = await this.client.db.models.Category.findOne({
						where: {
							id: c.id
						}
					});
					category.name = c.name;
					category.roles = c.roles;
					category.max_per_member = c.max_per_member;
					category.name_format = c.name_format;
					category.save();

					let cat_channel = await this.client.channels.fetch(c.id);

					if (cat_channel.name !== c.name)
						await cat_channel.setName(c.name, `Tickets category updated by ${message.member.user.tag}`);

					for (let r of c.roles) {
						await cat_channel.updateOverwrite(r, {
							VIEW_CHANNEL: true,
							READ_MESSAGE_HISTORY: true,
							SEND_MESSAGES: true,
							ATTACH_FILES: true
						}, `Tickets category updated by ${message.member.user.tag}`);
					}

				} else {

					// create a new category
					const allowed_permissions = ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'];
					let cat_channel = await message.guild.channels.create(c.name, {
						type: 'category',
						reason: `Tickets category created by ${message.member.user.tag}`,
						position: 0,
						permissionOverwrites: [
							...[
								{
									id: message.guild.roles.everyone,
									deny: ['VIEW_CHANNEL']
								},
								{
									id: this.client.user.id,
									allow: allowed_permissions
								}
							],
							...c.roles.map(r => {
								return {
									id: r,
									allow: allowed_permissions
								};
							})
						]
					});
					await this.client.db.models.Category.create({
						id: cat_channel.id,
						max_per_member: c.max_per_member,
						name: c.name,
						name_format: c.name_format,
						guild: message.guild.id,
						roles: c.roles,
					});

				}
			}
			this.client.log.success(`Updated guild settings for "${message.guild.name}"`);
			message.channel.send(i18n('commands.settings.response.updated'));
		
		} else {

			// upload settings as json to be modified
			let data = {
				categories: [],
				colour: settings.colour,
				command_prefix: settings.command_prefix,
				error_colour: settings.error_colour,
				locale: settings.locale,
				log_messages: settings.log_messages,
				success_colour: settings.success_colour,
			};

			let categories = await this.client.db.models.Category.findAll({
				where: {
					guild: message.guild.id
				}
			});

			data.categories = categories.map(c =>{
				return {
					id: c.id,
					max_per_member: c.max_per_member,
					name: c.name,
					name_format: c.name_format,
					roles: c.roles
				};
			});

			let attachment = new MessageAttachment(
				Buffer.from(JSON.stringify(data, null, 2)),
				`Settings for ${message.guild.name}.json`
			);

			message.channel.send({
				files: [attachment]
			});
			
		}
	}
};