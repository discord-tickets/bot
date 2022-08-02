const { SlashCommand } = require('@eartharoid/dbf');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = class TopicSlashCommand extends SlashCommand {
	constructor(client, options) {
		const descriptionLocalizations = {};
		client.i18n.locales.forEach(l => (descriptionLocalizations[l] = client.i18n.getMessage(l, 'commands.slash.topic.description')));

		const nameLocalizations = {};
		client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, 'commands.slash.topic.name')));

		let opts = [
			{
				name: 'new-topic',
				required: true,
				type: ApplicationCommandOptionType.String,
			},
		];
		opts = opts.map(o => {
			const descriptionLocalizations = {};
			client.i18n.locales.forEach(l => (descriptionLocalizations[l] = client.i18n.getMessage(l, `commands.slash.topic.options.${o.name}.description`)));

			const nameLocalizations = {};
			client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, `commands.slash.topic.options.${o.name}.name`)));

			return {
				...o,
				description: descriptionLocalizations['en-GB'],
				descriptionLocalizations,
				nameLocalizations: nameLocalizations,
			};
		});

		super(client, {
			...options,
			description: descriptionLocalizations['en-GB'],
			descriptionLocalizations,
			dmPermission: false,
			name: nameLocalizations['en-GB'],
			nameLocalizations,
			options: opts,
		});
	}

	async run(interaction) { }
};