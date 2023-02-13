const { UserCommand } = require('@eartharoid/dbf');

module.exports = class CreateUserCommand extends UserCommand {
	constructor(client, options) {
		const nameLocalizations = {};
		client.i18n.locales.forEach(l => (nameLocalizations[l] = client.i18n.getMessage(l, 'commands.user.create.name')));

		super(client, {
			...options,
			dmPermission: false,
			name: nameLocalizations['en-GB'],
			nameLocalizations,
		});
	}

	async run(/* interaction */) {
		// TODO: isStaff?
		// TODO: user->create
		// select category
		// send button
	}
};