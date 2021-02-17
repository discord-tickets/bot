module.exports = client => {
	client.config.plugins.forEach(plugin => {
		try {
			let package = require(`${plugin}/package.json`);
			client.log.plugins(`Loading ${package.name} v${package.version} by ${package.author?.name || 'unknown'}`);
			require(plugin)(client);
		} catch (e) {
			client.log.warn(`An error occurred whilst loading ${plugin}, have you installed it?`);
			client.log.error(e);
			return process.exit();
		}
	});
	
};