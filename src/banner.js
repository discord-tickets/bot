const link = require('terminal-link');
const leeks = require('leeks.js');

const { version, homepage } = require('../package.json');

module.exports = () => {
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
	console.log(leeks.colours.cyanBright(`Discord Tickets bot v${version} by eartharoid`));
	console.log(leeks.colours.cyanBright(homepage + '\n'));
	console.log(leeks.colours.cyanBright(`Please ${link('donate', 'https://ko-fi.com/eartharoid')} if you find this bot useful`));
	console.log('\n\n');
};