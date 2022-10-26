const { SlashCommand } = require('@eartharoid/dbf');

module.exports = class ClaimSlashCommand extends SlashCommand {
	constructor(client, options) {
		const name = 'claim';
		super(client, {
			...options,
			description: client.i18n.getMessage(null, `commands.slash.${name}.description`),
			descriptionLocalizations: client.i18n.getAllMessages(`commands.slash.${name}.description`),
			dmPermission: false,
			name,
			nameLocalizations: client.i18n.getAllMessages(`commands.slash.${name}.name`),
		});
	}

	async run(interaction) {
		// tickets/manager.js
	}
};