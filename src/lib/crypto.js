const Cryptr = require('cryptr');

let decrypt, encrypt;

if (process.env.OVERRIDE_ENCRYPTION === 'true') {
	encrypt = data => data;
	decrypt = data => data;
} else {
	const cryptr = new Cryptr(process.env.ENCRYPTION_KEY);
	decrypt = cryptr.decrypt.bind(cryptr);
	encrypt = cryptr.encrypt.bind(cryptr);
}

module.exports = {
	decrypt,
	encrypt,
};
