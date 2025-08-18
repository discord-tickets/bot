const { StdinCommand } = require('@eartharoid/dbf');
const { spawn } = require('child_process');

module.exports = class extends StdinCommand {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'npx',
		});
	}

	async run(input) {
		if (!input[0]) return this.client.log.warn('Usage: npx <command> [args]');
		const child = spawn('npx', input, { shell: true });
		for await (const data of child.stdout) this.client.log.info('npx:', data.toString());
		for await (const data of child.stderr) this.client.log.warn('npx:', data.toString());
	}
};
