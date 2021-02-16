module.exports = {
	event: 'messageReactionAdd',
	execute: (client, r, u) => {
		client.log.info('messageReactionAdd');
		console.log(r);
		console.log(u);
	}
};