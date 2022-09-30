const { MessageCommand } = require('@eartharoid/dbf');
const { useGuild } = require('../../lib/tickets/utils');

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

	/**
	 * @param {import("discord.js").MessageContextMenuCommandInteraction} interaction
	 */
	async run(interaction) {
		await useGuild(this.client, interaction, { referencesMessage: interaction.targetMessage.channelId + '/' + interaction.targetId });
	}
};