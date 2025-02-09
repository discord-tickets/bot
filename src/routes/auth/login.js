const { randomBytes } = require('crypto');

module.exports.get = () => ({
	handler: async function (req, res) {
		const { client } = req.routeOptions.config;

		const state = new URLSearchParams({
			redirect: req.query.r ?? '',
			secret: randomBytes(8).toString('hex'),
		});

		res.setCookie('oauth2-state', state.toString(), {
			httpOnly: true,
			sameSite: 'lax',
		});

		const params = {
			client_id: client.user.id,
			// ? prompt: 'none',
			redirect_uri: `${process.env.HTTP_EXTERNAL}/auth/callback`, // if not set defaults to first allowed
			response_type: 'code',
			scope: 'guilds identify',
			state: state.get('secret'),
		};

		if (req.query.invite !== undefined) {
			params.prompt = 'consent'; // already implied by the bot scope
			params.scope = 'applications.commands applications.commands.permissions.update bot ' + params.scope;
			params.integration_type = '0';
			params.permissions = '268561488';
			if (req.query.guild) {
				params.guild_id = req.query.guild;
				params.disable_guild_select = 'true';
			}
		} else if (req.query.role === 'admin') { // invite implies admin already
			params.scope = 'applications.commands.permissions.update ' + params.scope;
		}

		const url = new URL('https://discord.com/oauth2/authorize');
		url.search = new URLSearchParams(params);

		res.redirect(url.toString());
	},
});
