const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.ENCRYPTION_KEY);
const encryptedFields = [
	// 'name',
	'content',
	'username',
	'displayName',
	// 'channelName',
	// 'openingMessage',
	// 'description',
	'value',
	// 'placeholder',
	'closedReason',
	'topic',
	'comment',
	// 'label',
	// 'regex',
];

const encrypt = obj => {
	for (const prop in obj) {
		if (typeof obj[prop] === 'string' && obj[prop].length !== 0 && encryptedFields.includes(prop)) {
			obj[prop] = cryptr.encrypt(obj[prop]);
		} else if (typeof obj[prop] === 'object') {
			obj[prop] = encrypt(obj[prop]);
		}
	}
	return obj;
};

const decrypt = obj => {
	for (const prop in obj) {
		if (typeof obj[prop] === 'string' && obj[prop].length !== 0 && encryptedFields.includes(prop)) {
			obj[prop] = cryptr.decrypt(obj[prop]);
		} else if (typeof obj[prop] === 'object') {
			obj[prop] = decrypt(obj[prop]);
		}
	}
	return obj;
};

module.exports = async (params, next) => {
	if (params.args.create) params.args.create = encrypt(params.args.create);
	if (params.args.data) params.args.data = encrypt(params.args.data);
	if (params.args.update) params.args.update = encrypt(params.args.update);
	let result = await next(params);
	if (result) result = decrypt(result);
	return result;
};