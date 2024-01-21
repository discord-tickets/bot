const { domain } = require('../../lib/http');

module.exports.get = () => ({
	handler: async function (req, res) { // MUST NOT use arrow function syntax
		const data = await (await fetch('https://discord.com/api/oauth2/token', {
			body: new URLSearchParams({
				client_id: req.routeOptions.config.client.user.id,
				client_secret: process.env.DISCORD_SECRET,
				code: req.query.code,
				grant_type: 'authorization_code',
				redirect_uri: `${process.env.HTTP_EXTERNAL}/auth/callback`,
			}).toString(),
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			method: 'POST',
		})).json();
		const redirect = this.states.get(req.query.state) || '/';
		this.states.delete(req.query.state);
		const user = await (await fetch('https://discordapp.com/api/users/@me', { headers: { 'Authorization': `Bearer ${data.access_token}` } })).json();
		const token = this.jwt.sign({
			accessToken: data.access_token,
			avatar: user.avatar,
			discriminator: user.discriminator,
			expiresAt: Date.now() + (data.expires_in * 1000),
			id: user.id,
			locale: user.locale,
			username: user.username,
		});
		res.setCookie('token', token, {
			domain,
			httpOnly: true,
			maxAge: data.expires_in,
			path: '/',
			sameSite: 'Lax',
			secure: false,
		});
		return res.redirect(303, redirect);
	},
});
