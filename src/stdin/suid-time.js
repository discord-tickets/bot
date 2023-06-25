const { StdinCommand } = require('@eartharoid/dbf');
const ShortUniqueId = require('short-unique-id');
const uid = new ShortUniqueId();

module.exports = class extends StdinCommand {
	constructor(client, options) {
		super(client, {
			...options,
			id: 'suid-time',
		});
	}

	async run(input) {
		try {
			input = input.filter(str => str.length > 0);
			this.client.log.info('Timestamp:', uid.parseStamp(input[0]));
		} catch (error) {
			this.client.log.error(error);
		}
	}
};


