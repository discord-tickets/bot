const fetch = require('node-fetch');
const boxen = require('boxen');
const link = require('terminal-link');
const semver = require('semver');

let { version: current } = require('../package.json');

module.exports = async client => {
	if (!client.config.update_notice) return;
	const json = await (await fetch('https://api.github.com/repos/discord-tickets/bot/releases')).json();
	const update = json[0];

	let latest = semver.coerce(update.tag_name);

	if (!semver.valid(latest)) return;

	if (semver.lt(current, latest)) {
		client.log.notice(client.log.f(`There is an update available for Discord Tickets (${current} -> ${update.tag_name})`));

		let notice = [];
		notice.push(`&6You are currently using &c${current}&6, the latest is &a${update.tag_name}&6.`);
		notice.push(`&6Download "&f${update.name}&6" from`);
		notice.push(link('&6the GitHub releases page', 'https://github.com/discord-tickets/bot/releases/'));

		console.log(
			boxen(client.log.f(notice.join('\n')), {
				padding: 1,
				margin: 1,
				align: 'center',
				borderColor: 'yellow',
				borderStyle: 'round'
			})
		);
	}
};