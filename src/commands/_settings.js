const Command = require('../modules/commands/command');
const fetch = require('node-fetch');
const { MessageAttachment } = require('discord.js');

module.exports = class SettingsCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.get(client.config.locale);
		super(client, {
			internal: true,
			slash: false,
			name: i18n('commands.settings.name'),
			description: i18n('commands.settings.description'),
			permissions: ['MANAGE_GUILD']
		});
	}

	async execute({ guild, channel, member }, message) {

		let settings = await guild.settings;
		const i18n = this.client.i18n.get(settings.locale);

		let attachments = [ ...message.attachments.values() ];

		if (attachments.length >= 1) {

			// load settings from json
			this.client.log.info(`Downloading settings for "${guild.name}"`);
			let data = await (await fetch(attachments[0].url)).json();
			settings.colour = data.colour;
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
					category.save();

					let cat_channel = await this.client.channels.fetch(c.id);

					if (cat_channel.name !== c.name)
						await cat_channel.setName(c.name, `Tickets category updated by ${member.user.tag}`);

					for (let r of c.roles) {
						await cat_channel.updateOverwrite(r, {
							VIEW_CHANNEL: true,
							READ_MESSAGE_HISTORY: true,
							SEND_MESSAGES: true,
							ATTACH_FILES: true
						}, `Tickets category updated by ${member.user.tag}`);
					}

				} else {

					// create a new category
					const allowed_permissions = ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'];
					let cat_channel = await guild.channels.create(c.name, {
						type: 'category',
						reason: `Tickets category created by ${member.user.tag}`,
						permissionOverwrites: [
							...[
								{
									id: guild.roles.everyone,
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
						name: c.name,
						guild: guild.id,
						roles: c.roles
					});

				}
			}
			this.client.log.success(`Updated guild settings for "${guild.name}"`);
			channel.send(i18n('commands.settings.response.updated'));
		
		} else {

			// upload settings as json to be modified
			let data = {
				categories: [],
				colour: settings.colour,
				error_colour: settings.error_colour,
				locale: settings.locale,
				log_messages: settings.log_messages,
				success_colour: settings.success_colour,
			};

			let categories = await this.client.db.models.Category.findAll({
				where: {
					guild: guild.id
				}
			});

			data.categories = categories.map(c =>{
				return {
					id: c.id,
					name: c.name,
					roles: c.roles
				};
			});

			let attachment = new MessageAttachment(
				Buffer.from(JSON.stringify(data, null, 2)),
				`Settings for ${guild.name}.json`
			);

			channel.send({
				files: [attachment]
			});
			
		}
	}
};