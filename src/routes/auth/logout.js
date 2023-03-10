module.exports.get = fastify => ({
	handler: async function (req, res) {
		await fetch('https://discord.com/api/oauth2/token/revoke', {
			body: new URLSearchParams({ token: req.user.payload.accessToken }).toString(),
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			method: 'POST',
		});
		res
			.clearCookie('token', '/')
			.send('The token has been revoked.');
	},
	onRequest: [fastify.authenticate],
});