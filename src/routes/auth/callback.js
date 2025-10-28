module.exports.get = () => ({
	handler: async function (req, res) {
		const cookie = req.cookies['oauth2-state'];
		if (!cookie) {
			return res.code(400).send({
				error: 'Bad Request',
				message: 'State is missing.',
				statusCode: 400,

			});
		}

		const state = new URLSearchParams(cookie);
		if (state.get('secret') !== req.query.state) {
			return res.code(400).send({
				error: 'Bad Request',
				message: 'Invalid state.',
				statusCode: 400,

			});
		}

		// TODO: check if req.query.permissions are correct

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

		const redirect = (data.guild?.id && `/settings/${data.guild?.id}`) || state.get('redirect') || '/';

		const bearerOptions = { headers: { 'Authorization': `Bearer ${data.access_token}` } };
		const user = await (await fetch('https://discordapp.com/api/users/@me', bearerOptions)).json();

		let scopes;
		if (data.scope) {
			scopes = data.scope.split(' ');
		} else {
			const auth = await (await fetch('https://discordapp.com/api/oauth2/@me', bearerOptions)).json();
			scopes = auth.scopes;
		}

		const token = this.jwt.sign({
			accessToken: data.access_token,
			avatar: user.avatar,
			expiresAt: Date.now() + (data.expires_in * 1000),
			id: user.id,
			locale: user.locale,
			scopes,
			username: user.username,
		});

		res.setCookie('token', token, {
			httpOnly: true,
			maxAge: data.expires_in,
			path: '/',
			sameSite: 'Strict',
			secure: false,
		});
		res.header('Content-Type', 'text/html');
		return res.send(`
<!DOCTYPE html>
<html>
<head><meta http-equiv="refresh" content="0; url='${redirect}'"></head>
<body></body>
</html>
`);
	},
});
