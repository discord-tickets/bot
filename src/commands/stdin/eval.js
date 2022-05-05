const { StdinCommand } = require('@eartharoid/dbf');

module.exports = class extends StdinCommand {
	constructor(client) {
		super(client, {
			id: 'stdinEval',
			name: 'eval',
		});
	}

	async run(input) {
		const toEval = input.join(' ');
		try {
			const res = await eval(toEval);
			console.log(res);
		} catch (error) {
			this.client.log.error(error);
		}
	}
};