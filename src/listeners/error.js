module.exports = {
	event: 'error',
	execute: (client, error) => {
		client.log.warn('The client encountered an error');
		client.log.error(error);
	}
};