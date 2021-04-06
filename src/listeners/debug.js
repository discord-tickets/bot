module.exports = {
	event: 'debug',
	execute: (client, data) => {
		if (client.config.debug) client.log.debug(data);
	}
};