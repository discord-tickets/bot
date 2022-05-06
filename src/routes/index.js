module.exports.get = () => ({
	handler: (req, res) => {
		const { client } = res.context.config;
		return `Hello, I am ${client.user.username}!`;
	},
});