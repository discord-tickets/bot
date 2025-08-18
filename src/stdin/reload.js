const { StdinCommand } = require('@eartharoid/dbf');

module.exports = class extends StdinCommand {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'reload',
		});
	}

	async run() {
		this.client.log.warn('Reloading is not the same as restarting!');
		this.client.log.info('Reinitialising client...');
		await this.client.init(true);
		this.client.log.success('Client reinitialised');
		// TODO: fix this
		// this.client.log.info('Reloading module components...');
		// this.client.mods.forEach(mod => mod.components.forEach(component => component.reload()));
		// this.client.log.success('Components reloaded');
	}
};
