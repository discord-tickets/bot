const { StdinCommand } = require('@eartharoid/dbf');
const { inspect } = require('util');

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
				.catch(error => {
					this.client.log.warn('Failed to publish commands');
					this.client.log.error(error);
					this.client.log.error(inspect(error.rawError?.errors, { depth: Infinity }));
				});
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