const fetch = require('node-fetch');
const boxen = require('boxen');
const link = require('terminal-link');
const semver = require('semver');
const { format } = require('leekslazylogger-fastify');

let { version: current } = require('../package.json');

module.exports = async client => {
	if (!client.config.update_notice) return;
	const json = await (await fetch('https://api.github.com/repos/discord-tickets/bot/releases')).json();
	const update = json[0];

	let latest = semver.coerce(update.tag_name);

	if (!semver.valid(latest)) return;

	if (semver.lt(current, latest)) {
		client.log.notice(`There is an update available for Discord Tickets (${current} -> ${update.tag_name})`);

		let lines = [
			`&k&6You are currently using &c${current}&6, the latest is &a${update.tag_name}&6.&r`,
			`&k&6Download "&f${update.name}&6" from&r`,
			link('&k&6the GitHub releases page.&r&6', 'https://github.com/discord-tickets/bot/releases/')
		];

		console.log(
			boxen(format(lines.join('\n')), {
				padding: 1,
				margin: 1,
				align: 'center',
				borderColor: 'yellow',
				borderStyle: 'round'
			})
		);
	}
};