const { randomBytes } = require('crypto');

module.exports.get = () => ({
	handler: async function (req, res) {
		const { client } = req.routeOptions.config;

		const state = randomBytes(8).toString('hex');
		this.states.set(state, null);

		const url = new URL('https://discord.com/oauth2/authorize');
		url.searchParams.set('response_type', 'code');
		url.searchParams.set('client_id', client.user.id);
		url.searchParams.set('prompt', 'none');
		url.searchParams.set('redirect_uri', `${process.env.HTTP_EXTERNAL}/auth/callback`); // window.location.origin
		url.searchParams.set('scope', 'applications.commands applications.commands.permissions.update bot guilds identify');
		url.searchParams.set('permissions', '268561488');

		if (req.query.guild) {
			url.searchParams.set('guild_id', req.query.guild);
			url.searchParams.set('disable_guild_select', 'true');
		}

		res.setCookie('oauth2-redirect-state', state, {
			httpOnly: true,
			sameSite: 'lax',
		});
		res.redirect(url.toString());
	},
});
