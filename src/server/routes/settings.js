const fetch = require('node-fetch');

module.exports = {
	method: 'get',
	route: '/settings',
	execute: async (plugin, req, res) => {

		let expires_at = req.session.get('expires_at');
		if (!expires_at) res.redirect(307, '/auth/login');
		let expired = expires_at < Date.now();
		if (expired) res.redirect(307, '/auth/login');

		let data = await (await fetch('https://discordapp.com/api/users/@me', {
			headers: {
				'Authorization': `Bearer ${req.session.get('access_token')}`
			}
		})).json();

		console.log(data);

		return `Hello, ${data.username}`;
	}
};