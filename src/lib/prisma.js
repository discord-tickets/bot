const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.ENCRYPTION_KEY);
const fields = [
	'name',
	'content',
	'username',
	'displayName',
	// 'channelName',
	'openingMessage',
	'description',
	'value',
	'placeholder',
	'closedReason',
	'topic',
	'comment',
	'label',
	'regex',
];
const shouldEncrypt = ['create', 'createMany', 'update', 'updateMany', 'upsert'];
// const shouldDecrypt = ['findUnique', 'findFirst', 'findMany'];




module.exports = log => {
	const encrypt = obj => {
		for (const prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				if (typeof obj[prop] === 'object') {
					obj[prop] = encrypt(obj[prop]);
				} else if (typeof obj[prop] === 'string' && obj[prop].length !== 0 && fields.includes(prop)) {
					try {
						obj[prop] = cryptr.encrypt(obj[prop]);
					} catch (error) {
						log.warn(`Failed to encrypt ${prop}`);
						log.debug(error);
					}
				}
			}
		}
		return obj;
	};

	const decrypt = obj => {
		for (const prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				if (typeof obj[prop] === 'object') {
					obj[prop] = decrypt(obj[prop]);
				} else if (typeof obj[prop] === 'string' && obj[prop].length !== 0 && fields.includes(prop)) {
					try {
						obj[prop] = cryptr.decrypt(obj[prop]);
					} catch (error) {
						log.warn(`Failed to decrypt ${prop}`);
						log.debug(error);
					}
				}
			}
		}
		return obj;
	};

	return async (params, next) => {
		if (params.args.data && shouldEncrypt.includes(params.action)) params.args = encrypt(params.args);
		let result = await next(params);
		// if (result && shouldDecrypt.includes(params.action)) result = decrypt(result);
		if (result) result = decrypt(result);
		return result;
	};
};