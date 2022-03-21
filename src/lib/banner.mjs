import { colours } from 'leeks.js';
import figlet from 'figlet';
import link from 'terminal-link';

export default version => colours.cyan(figlet.textSync('Discord', { font: 'Banner3' })) +
	colours.cyan('\n\n' + figlet.textSync('Tickets', { font: 'Banner3' })) +
	colours.cyanBright(`\n\n${link('Discord Tickets', 'https://discordtickets.app')} bot v${version} by eartharoid`) +
	colours.cyanBright('\n' + link('Sponsor this project', 'https://discordtickets.app/sponsor')) +
	'\n\n';
