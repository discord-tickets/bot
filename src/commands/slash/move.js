const { SlashCommand } = require('@eartharoid/dbf');
const { ApplicationCommandOptionType } = require('discord.js');

module.exports = class MoveSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'move';
		super(client, {
			...options,
			description: client.i18n.getMessage(null, `commands.slash.${name}.description`),
			descriptionLocalizations: client.i18n.getAllMessages(`commands.slash.${name}.description`),
			dmPermission: false,
			name,
			nameLocalizations: client.i18n.getAllMessages(`commands.slash.${name}.name`),
			options: [
				{
					autocomplete: true,
					name: 'category',
					required: true,
					type: ApplicationCommandOptionType.Integer,
				},
			].map(option => {
				option.descriptionLocalizations = client.i18n.getAllMessages(`commands.slash.${name}.options.${option.name}.description`);
				option.description = option.descriptionLocalizations['en-GB'];
				option.nameLocalizations = client.i18n.getAllMessages(`commands.slash.${name}.options.${option.name}.name`);
				return option;
			}),
		});
	}

	async run(interaction) {
		// TODO: check discordCategory max but not category max (ignore)
		// TODO: update cached count for both categories and category-members (from and to)
	}
};
