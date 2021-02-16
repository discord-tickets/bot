const yarpm = require('yarpm');
const fs = require('fs');
const { join } = require('path');
const { path } = require('../utils/fs');

module.exports = async client => {
	const plugins = {};
	const dirs = fs.readdirSync(path('./user/plugins'));

	for (const dir of dirs) {
		let package_path = path(`./user/plugins/${dir}/package.json`);
		if (!fs.existsSync(package_path)) continue;

		let package = require(`../../user/plugins/${dir}/package.json`);
		let main = require(join(`../../user/plugins/${dir}/`, package.main));

		plugins[package.name] = package;
		client.log.plugins(`Loading ${package.name} v${package.version} by ${package.author}`);

		if (package.dependencies && Object.keys(package.dependencies).length >= 1) {
			client.log.plugins(`Installing dependencies for ${package.name}`);
			let deps = Object.keys(package.dependencies)
				.map(d => `${d}@${package.dependencies[d]}`)
				.join(' ');

			await yarpm(['install', '--no-save', deps], {
				stdout: process.stdout
			});
			await main(client);
		} else {
			await main(client);
		}
		
	}
};