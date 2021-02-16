module.exports = {
	event: 'ready',
	execute: client => {
		client.log.success(`Connected to Discord as ${client.user.tag}`);
	}
};