module.exports = {
	event: 'connect',
	execute: (plugin, data) => {
		plugin.client.log.ws('Client connected to settings socket');
	}
};