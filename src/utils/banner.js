/**
 * 
 *  @name DiscordTickets
 *  @author eartharoid <contact@eartharoid.me>
 *  @license GNU-GPLv3
 * 
 */

const { version, homepage } = require('../../package.json');
module.exports = (leeks) => {
	console.log(leeks.colours.cyan(`
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
`));
	console.log(leeks.colours.cyanBright(`DiscordTickets bot v${version} by eartharoid`));
	console.log(leeks.colours.cyanBright(homepage));
	console.log('\n\n');
};