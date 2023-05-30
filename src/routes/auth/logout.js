const { domain } = require('../../lib/http');

module.exports.get = fastify => ({
	handler: async function (req, res) {
		const { accessToken } = req.user;

		await fetch('https://discord.com/api/oauth2/token/revoke', {
			body: new URLSearchParams({ token: accessToken }).toString(),
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			method: 'POST',
		});

		res.clearCookie('token', {
			domain,
			httpOnly: true,
			path: '/',
			sameSite: 'Lax',
			secure: false,
		}).send('The token has been revoked.');
	},
	onRequest: [fastify.authenticate],
});
