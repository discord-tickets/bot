const Command = require('../modules/commands/command');

module.exports = class SettingsCommand extends Command {
	constructor(client) {
		const i18n = client.i18n.get(client.config.locale);
		super(client, {
			internal: true,
			slash: false,
			name: i18n('commands.settings.name'),
			description: i18n('commands.settings.description'),
			permissions: ['MANAGE_GUILD']
		});
	}

	async execute({ guild, member, channel, args }, message) {

		let settings = await guild.settings;
		const i18n = this.client.i18n.get(settings.locale);

		channel.send('Settings!');
	}
};