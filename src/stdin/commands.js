const { StdinCommand } = require('@eartharoid/dbf');

module.exports = class Commands extends StdinCommand {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'commands',
		});
	}

	async run(args) {
		switch (args[0]) {
		case 'publish': {
			this.client.commands.publish()
				.then(commands => {
					if (!commands) return console.log('None published');
					console.log('Published %d commands', commands.size);
				})
				.catch(console.error);
			break;
		}
		}
	}
};