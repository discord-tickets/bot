const { StdinCommand } = require('@eartharoid/dbf');

module.exports = class extends StdinCommand {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'eval',
		});
	}

	async run(input) {
		const toEval = input.join(' ');
		try {
			const res = await eval(toEval);
			console.log(res); // eslint-disable-line no-console
			return true;
		} catch (error) {
			this.client.log.error(error);
			return false;
		}
	}
};