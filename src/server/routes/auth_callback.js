const fetch = require('node-fetch');
const FormData = require('form-data');

module.exports = {
	method: 'get',
	route: '/auth/callback',
	execute: async (plugin, req, res) => {

		if (!req.query.code) {
			res.status(400);
			return 'Bad Request: no code';
		}

		if (req.query.state !== 'apollo') {
			res.status(400);
			return 'Bad Request: state mismatch';
		}

		const data = new FormData();
		data.append('client_id', plugin.client.user.id);
		data.append('client_secret', process.env.DISCORD_SECRET);
		data.append('grant_type', 'authorization_code');
		data.append('redirect_uri', plugin.redirect_uri);
		data.append('scope', 'identify guild');
		data.append('code', req.query.code);

		let {
			access_token,
			expires_in,
			refresh_token
		} = await (await fetch('https://discordapp.com/api/oauth2/token', {
			method: 'POST',
			body: data,
		})).json();
	
		expires_in = expires_in * 1000;
		let expires_at = Date.now() + expires_in;

		req.session.set('access_token', access_token);
		req.session.set('expires_in', expires_in);
		req.session.set('expires_at', expires_at);
		req.session.set('refresh_token', refresh_token);

		res.redirect(307, '/settings');

	}
};