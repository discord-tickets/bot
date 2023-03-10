const { domain } = require('../../lib/http');

module.exports.get = () => ({
	handler: async function (req, res) { // MUST NOT use arrow function syntax
		const {
			access_token: accessToken,
			expires_in: expiresIn,
		} = await this.discord.getAccessTokenFromAuthorizationCodeFlow(req);
		const user = await (await fetch('https://discordapp.com/api/users/@me', { headers: { 'Authorization': `Bearer ${accessToken}` } })).json();
		const payload = {
			accessToken,
			avatar: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`,
			discriminator: user.discriminator,
			expiresAt: Date.now() + (expiresIn * 1000),
			id: user.id,
			locale: user.locale,
			username: user.username,

		};
		const token = this.jwt.sign({ payload });
		res
			.setCookie('token', token, {
				domain,
				httpOnly: true,
				maxAge: expiresIn,
				path: '/',
				sameSite: true,
				secure: false,
			})
			.redirect(this.states.get(req.query.state) || '/');
		this.states.delete(req.query.state);
	},
});