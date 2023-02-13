/* eslint-disable no-console */
const { randomBytes } = require('crypto');
const { short } = require('leeks.js');

console.log(short(
	'Set the "ENCRYPTION_KEY" environment variable to: \n&!b ' +
	randomBytes(24).toString('hex') +
	' &r\n\n&0&!e WARNING &r &e&lIf you lose the encryption key, most of the data in the database will become unreadable, requiring a new key and a full reset.',
));