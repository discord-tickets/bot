const { SlashCommand } = require('@eartharoid/dbf');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = class TranscriptSlashCommand extends SlashCommand {
	constructor(client, options) {
		const descriptionLocalizations = {};
		client.i18n.locales.forEach(l => (descriptionLocalizations[l] = client.i18n.getMessage(l, 'commands.slash.transcript.description')));

		const nameLocalizations = {};
		client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, 'commands.slash.transcript.name')));

		let opts = [
			{
				autocomplete: true,
				name: 'ticket',
				required: true,
				type: ApplicationCommandOptionType.Integer,
			},
		];
		opts = opts.map(o => {
			const descriptionLocalizations = {};
			client.i18n.locales.forEach(l => (descriptionLocalizations[l] = client.i18n.getMessage(l, `commands.slash.transcript.options.${o.name}.description`)));

			const nameLocalizations = {};
			client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, `commands.slash.transcript.options.${o.name}.name`)));

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