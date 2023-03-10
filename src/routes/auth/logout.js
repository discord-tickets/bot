module.exports.get = () => ({
	handler: async function (req, res) {
		res
			.clearCookie('token', '/')
			.send('Logged out.');
	},
});