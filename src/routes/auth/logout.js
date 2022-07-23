module.exports.get = () => ({
	handler: async function (req, res) { // must NOT use arrow function syntax
		res
			.clearCookie('token', '/')
			.send('Logged out.');
	},
});