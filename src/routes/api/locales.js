module.exports.get = () => ({
	handler: async req => {
		/** @type {import("client")} */
		const client = req.routeOptions.config.client;
		return client.i18n.locales;
	},
});
