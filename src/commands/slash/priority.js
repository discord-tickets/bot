const { SlashCommand } = require('@eartharoid/dbf');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = class PrioritySlashCommand extends SlashCommand {
	constructor(client, options) {
		const descriptionLocalizations = {};
		client.i18n.locales.forEach(l => (descriptionLocalizations[l] = client.i18n.getMessage(l, 'commands.slash.priority.description')));

		const nameLocalizations = {};
		client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, 'commands.slash.priority.name')));

		let opts = [
			{
				choices: ['HIGH', 'MEDIUM', 'LOW'],
				name: 'priority',
				required: true,
				type: ApplicationCommandOptionType.String,
			},
		];
		opts = opts.map(o => {
			const descriptionLocalizations = {};
			client.i18n.locales.forEach(l => (descriptionLocalizations[l] = client.i18n.getMessage(l, `commands.slash.priority.options.${o.name}.description`)));

			const nameLocalizations = {};
			client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, `commands.slash.priority.options.${o.name}.name`)));

			if (o.choices) {
				o.choices = o.choices.map(c => {
					const nameLocalizations = {};
					client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, `commands.slash.priority.options.${o.name}.choices.${c}`)));
					return {
						name: nameLocalizations['en-GB'],
						nameLocalizations: nameLocalizations,
						value: c,
					};
				});
			}

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