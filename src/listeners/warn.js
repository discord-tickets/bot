module.exports = {
	event: 'warn',
	execute: (client, warning) => {
		client.log.warn(warning);
	}
};