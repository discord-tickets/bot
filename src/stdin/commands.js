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
				.then(commands => this.client.log.success('Published %d commands', commands?.size))
				.catch(this.client.log.error);
			break;
		}
		default: {
			this.client.log.info('subcommands: \n' + [
				'> commands publish',
			].join('\n'));
		}
		}
	}
};