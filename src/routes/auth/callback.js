const fetch = require('node-fetch');
const { domain } = require('../../lib/http');

module.exports.get = () => ({
	handler: async function (req, res) { // must NOT use arrow function syntax
		const {
			access_token, expires_in,
		} = await this.discord.getAccessTokenFromAuthorizationCodeFlow(req);
		const user = await (await fetch('https://discordapp.com/api/users/@me', { headers: { 'Authorization': `Bearer ${access_token}` } })).json();
		const payload = {
			avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`,
			discriminator: user.discriminator,
			expiresAt: Date.now() + (expires_in * 1000),
			id: user.id,
			username: user.username,

		};
		const token = this.jwt.sign({ payload });
		res
			.setCookie('token', token, {
				domain: domain,
				httpOnly: true,
				path: '/',
				sameSite: true,
				secure: false,
			})
			.redirect('/');
	},
});