const Command = require('../modules/commands/command');
// eslint-disable-next-line no-unused-vars
const {
	Message, // eslint-disable-line no-unused-vars
	MessageAttachment,
	MessageEmbed
} = require('discord.js');
const fsp = require('fs').promises;
const { path } = require('../utils/fs');
const mustache = require('mustache');

module.exports = class SurveyCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.getLocale(client.config.locale);
		super(client, {
			description: i18n('commands.survey.description'),
			internal: true,
			name: i18n('commands.survey.name'),
			options: async guild => {
				const surveys = await this.client.db.models.Survey.findAll({ where: { guild: guild.id } });
				return [
					{
						choices: surveys.map(survey => ({
							name: survey.name,
							value: survey.name
						})),
						description: i18n('commands.survey.options.survey.description'),
						name: i18n('commands.survey.options.survey.name'),
						required: true,
						type: Command.option_types.STRING
					}
				];
			},
			staff_only: true

		});
	}

	/**
	 * @param {Interaction} interaction
	 * @returns {Promise<void|any>}
	 */
	async execute(interaction) {
		const settings = await this.client.utils.getSettings(interaction.guild.id);
		const default_i18n = this.client.i18n.getLocale(this.client.config.defaults.locale);  // command properties could be in a different locale
		const i18n = this.client.i18n.getLocale(settings.locale);

		const name = interaction.options.getString(default_i18n('commands.survey.options.survey.name'));

		const survey = await this.client.db.models.Survey.findOne({
			where: {
				guild: interaction.guild.id,
				name
			}
		});

		if (survey) {
			const {
				rows: responses, count
			} = await this.client.db.models.SurveyResponse.findAndCountAll({ where: { survey: survey.id } });

			const users = new Set();

			for (const i in responses) {
				const ticket = await this.client.db.models.Ticket.findOne({ where: { id: responses[i].ticket } });
				users.add(ticket.creator);
				const answers = responses[i].answers.map(a => this.client.cryptr.decrypt(a));
				answers.unshift(ticket.number);
				responses[i] = answers;
			}

			let template = await fsp.readFile(path('./src/commands/extra/survey.template.html'), { encoding: 'utf8' });

			template = template.replace(/[\r\n\t]/g, '');

			survey.questions.unshift('Ticket #');

			const html = mustache.render(template, {
				columns: survey.questions,
				count: {
					responses: count,
					users: users.size
				},
				responses,
				survey: survey.name.charAt(0).toUpperCase() + survey.name.slice(1)
			});

			const attachment = new MessageAttachment(
				Buffer.from(html),
				`${survey.name}.html`
			);

			return await interaction.editReply({
				ephemeral: true,
				files: [attachment]
			});
		} else {
			const surveys = await this.client.db.models.Survey.findAll({ where: { guild: interaction.guild.id } });

			const list = surveys.map(s => `❯ **\`${s.name}\`**`);
			return await interaction.editReply({
				embeds: [
					new MessageEmbed()
						.setColor(settings.colour)
						.setTitle(i18n('commands.survey.response.list.title'))
						.setDescription(list.join('\n'))
						.setFooter(settings.footer, interaction.guild.iconURL())
				],
				ephemeral: true
			});
		}
	}
};
