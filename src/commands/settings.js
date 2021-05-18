const Command = require('../modules/commands/command');
const fetch = require('node-fetch');
// eslint-disable-next-line no-unused-vars
const { MessageAttachment, Message } = require('discord.js');
const { Validator } = require('jsonschema');

module.exports = class SettingsCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			internal: true,
			name: i18n('commands.settings.name'),
			description: i18n('commands.settings.description'),
			aliases: [
				i18n('commands.settings.aliases.config'),
			],
			process_args: false,
			args: [],
			permissions: ['MANAGE_GUILD']
		});

		this.schema = require('../settings.schema.json');

		this.v = new Validator();
	}

	/**
	 * @param {Message} message
	 * @param {string} args
	 * @returns {Promise<void|any>}
	 */
	async execute(message) {
		const settings = await message.guild.settings;
		const i18n = this.client.i18n.getLocale(settings.locale);

		const attachments = [ ...message.attachments.values() ];

		if (attachments.length >= 1) {

			// load settings from json
			this.client.log.info(`Downloading settings for "${message.guild.name}"`);
			const data = await (await fetch(attachments[0].url)).json();

			const { valid, errors } = this.v.validate(data, this.schema);

			if (!valid) {
				this.client.log.warn('Settings validation error');
				return await message.channel.send(i18n('commands.settings.response.invalid', errors.map(error => `\`${error.stack}\``).join(',\n')));
			}

			settings.colour = data.colour;
			settings.command_prefix = data.command_prefix;
			settings.error_colour = data.error_colour;
			settings.footer = data.footer;
			settings.locale = data.locale;
			settings.log_messages = data.log_messages;
			settings.success_colour = data.success_colour;
			settings.tags = data.tags;
			await settings.save();

			for (const c of data.categories) {
				if (c.id) {

					// existing category
					const cat_row = await this.client.db.models.Category.findOne({
						where: {
							id: c.id
						}
					});
					cat_row.claiming = c.claiming;
					cat_row.image = c.image;
					cat_row.max_per_member = c.max_per_member;
					cat_row.name = c.name;
					cat_row.name_format = c.name_format;
					cat_row.opening_message = c.opening_message;
					cat_row.opening_questions = c.opening_questions;
					cat_row.ping = c.ping;
					cat_row.require_topic = c.require_topic;
					cat_row.roles = c.roles;
					cat_row.survey = c.survey;
					cat_row.save();

					const cat_channel = await this.client.channels.fetch(c.id);

					if (cat_channel) {
						if (cat_channel.name !== c.name)
							await cat_channel.setName(c.name, `Tickets category updated by ${message.author.tag}`);

						for (const r of c.roles) {
							await cat_channel.updateOverwrite(r, {
								VIEW_CHANNEL: true,
								READ_MESSAGE_HISTORY: true,
								SEND_MESSAGES: true,
								ATTACH_FILES: true
							}, `Tickets category updated by ${message.author.tag}`);
						}
					}

				} else {

					// create a new category
					const allowed_permissions = ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'EMBED_LINKS', 'ATTACH_FILES'];
					const cat_channel = await message.guild.channels.create(c.name, {
						type: 'category',
						reason: `Tickets category created by ${message.author.tag}`,
						position: 1,
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
						claiming: c.claiming,
						guild: message.guild.id,
						image: c.image,
						max_per_member: c.max_per_member,
						name: c.name,
						name_format: c.name_format,
						opening_message: c.opening_message,
						opening_questions: c.opening_questions,
						ping: c.ping,
						require_topic: c.require_topic,
						roles: c.roles,
						survey: c.survey
					});

				}
			}

			for (const survey in data.surveys) {
				const survey_data = {
					guild: message.guild.id,
					name: survey,
				};
				const [s_row] = await this.client.db.models.Survey.findOrCreate({
					where: survey_data,
					defaults: survey_data
				});
				s_row.questions = data.surveys[survey];
				await s_row.save();
			}

			this.client.log.success(`Updated guild settings for "${message.guild.name}"`);
			return await message.channel.send(i18n('commands.settings.response.updated'));
		
		} else {

			// upload settings as json to be edited

			const categories = await this.client.db.models.Category.findAll({
				where: {
					guild: message.guild.id
				}
			});
			
			const surveys = await this.client.db.models.Survey.findAll({
				where: {
					guild: message.guild.id
				}
			});

			const data = {
				categories: categories.map(c => {
					return {
						id: c.id,
						claiming: c.claiming,
						image: c.image,
						max_per_member: c.max_per_member,
						name: c.name,
						name_format: c.name_format,
						opening_message: c.opening_message,
						opening_questions: c.opening_questions,
						ping: c.ping,
						require_topic: c.require_topic,
						roles: c.roles,
						survey: c.survey
					};
				}),
				colour: settings.colour,
				command_prefix: settings.command_prefix,
				error_colour: settings.error_colour,
				footer: settings.footer,
				locale: settings.locale,
				log_messages: settings.log_messages,
				success_colour: settings.success_colour,
				surveys: {},
				tags: settings.tags
			};

			for (const survey in surveys) {
				const { name, questions } = surveys[survey];
				data.surveys[name] = questions;
			}

			const attachment = new MessageAttachment(
				Buffer.from(JSON.stringify(data, null, 2)),
				`Settings for ${message.guild.name}.json`
			);

			message.channel.send({
				files: [attachment]
			});
	
		}
	}
};