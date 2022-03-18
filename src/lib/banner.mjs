import { colours } from 'leeks.js';
import link from 'terminal-link';

export default version => colours.cyan(`
########  ####  ######   ######   #######  ########  ########
##     ##  ##  ##    ## ##    ## ##     ## ##     ## ##     ##
##     ##  ##  ##       ##       ##     ## ##     ## ##     ##
##     ##  ##   ######  ##       ##     ## ########  ##     ##
##     ##  ##        ## ##       ##     ## ##   ##   ##     ##
##     ##  ##  ##    ## ##    ## ##     ## ##    ##  ##     ##
########  ####  ######   ######   #######  ##     ## ########
######## ####  ######  ##    ## ######## ########  ######
   ##     ##  ##    ## ##   ##  ##          ##    ##    ##
   ##     ##  ##       ##  ##   ##          ##    ##
   ##     ##  ##       #####    ######      ##     ######
   ##     ##  ##       ##  ##   ##          ##          ##
   ##     ##  ##    ## ##   ##  ##          ##    ##    ##
   ##    ####  ######  ##    ## ########    ##     ######
`) +
colours.cyanBright(`\n${link('Discord Tickets', 'https://discordtickets.app')} bot v${version} by eartharoid`) +
colours.cyanBright('\n' + link('Sponsor this project', 'https://discordtickets.app/sponsor')) +
'\n\n';