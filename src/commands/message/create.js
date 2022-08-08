const { MessageCommand } = require('@eartharoid/dbf');

module.exports = class CreateMessageCommand extends MessageCommand {
	constructor(client, options) {
		const nameLocalizations = {};
		client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, 'commands.message.create.name')));

		super(client, {
			...options,
			dmPermission: false,
			name: nameLocalizations['en-GB'],
			nameLocalizations,
		});
	}

	async run(interaction) {
		// TODO: archive message
	}
};