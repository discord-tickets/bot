const Command = require('../modules/commands/command');
// eslint-disable-next-line no-unused-vars
const { MessageAttachment, MessageEmbed, Message } = require('discord.js');
const fsp = require('fs').promises;
const { path } = require('../utils/fs');
const mustache = require('mustache');

module.exports = class SurveyCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			internal: true,
			name: i18n('commands.survey.name'),
			description: i18n('commands.survey.description'),
			aliases: [
				i18n('commands.survey.aliases.surveys')
			],
			process_args: false,
			args: [
				{
					name: i18n('commands.survey.args.survey.name'),
					description: i18n('commands.survey.args.survey.description'),
					example: i18n('commands.survey.args.survey.example'),
					required: false,
				}
			],
			staff_only: true
		});
	}

	/**
	 * @param {Message} message
	 * @param {string} args
	 * @returns {Promise<void|any>}
	 */
	async execute(message, args) {
		const settings = await message.guild.settings;
		const i18n = this.client.i18n.getLocale(settings.locale);

		const survey = await this.client.db.models.Survey.findOne({
			where: {
				name: args,
				guild: message.guild.id
			}
		});

		if (survey) {
			const { rows: responses, count } = await this.client.db.models.SurveyResponse.findAndCountAll({
				where: {
					survey: survey.id
				}
			});

			const users = new Set();


			for (const i in responses) {
				const ticket = await this.client.db.models.Ticket.findOne({
					where: {
						id: responses[i].ticket
					}
				});
				users.add(ticket.creator);
				const answers = responses[i].answers.map(a => this.client.cryptr.decrypt(a));
				answers.unshift(ticket.number);
				responses[i] = answers;
			}

			let template = await fsp.readFile(path('./src/commands/extra/survey.template.html'), {
				encoding: 'utf8'
			});

			template = template.replace(/[\r\n\t]/g, '');

			survey.questions.unshift('Ticket #');

			const html = mustache.render(template, {
				survey: survey.name.charAt(0).toUpperCase() + survey.name.slice(1),
				count: {
					responses: count,
					users: users.size
				},
				columns: survey.questions,
				responses
			});

			const attachment = new MessageAttachment(
				Buffer.from(html),
				`${survey.name}.html`
			);

			return await message.channel.send({
				files: [attachment]
			});
		} else {
			const surveys = await this.client.db.models.Survey.findAll({
				where: {
					guild: message.guild.id
				}
			});

			const list = surveys.map(s => `❯ **\`${s.name}\`**`);
			return await message.channel.send(
				new MessageEmbed()
					.setColor(settings.colour)
					.setTitle(i18n('commands.survey.response.list.title'))
					.setDescription(list.join('\n'))
					.setFooter(settings.footer, message.guild.iconURL())
			);
		}
	}
};