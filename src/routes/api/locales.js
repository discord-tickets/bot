module.exports.get = () => ({
	handler: async (req, res) => {
		/** @type {import("client")} */
		const client = res.context.config.client;
		return client.i18n.locales;
	},
});