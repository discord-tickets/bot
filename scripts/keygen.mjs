import { randomBytes } from 'crypto';
import { short } from 'leeks.js';

console.log(short(
	'Set the "DB_ENCRYPTION_KEY" environment variable to: \n&1&!f' +
	randomBytes(24).toString('hex') +
	'&r\n\n&0&!e WARNING &r &e&lDo not lose the encryption key or most of the data in the database will be unreadable, requiring a new key and a full reset.'
));