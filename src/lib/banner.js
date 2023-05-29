const { colours } = require('leeks.js');
const figlet = require('figlet');
const link = require('terminal-link');

module.exports = version => colours.cyan(figlet.textSync('Discord', { font: 'Banner3' })) +
	colours.cyan('\n\n' + figlet.textSync('Tickets', { font: 'Banner3' })) +
	colours.cyanBright(`\n\n${link('Discord Tickets', 'https://discordtickets.app')} bot v${version} by eartharoid`) +
	colours.cyanBright('\nSponsor this project at https://discordtickets.app/sponsor') +
	'\n\n';
