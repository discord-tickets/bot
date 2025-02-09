module.exports.get = () => ({
	handler: async function (req, res) {
		res.redirect(`/auth/login?invite&guild=${req.query.guild || ''}`);
	},
});
