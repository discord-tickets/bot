const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.ENCRYPTION_KEY);
const fields = [
	'name',
	'content',
	'username',
	'displayName',
	'channelName',
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
const shouldDecrypt = ['findUnique', 'findFirst', 'findMany'];

module.exports = async (params, next) => {
	if (params.args.data && shouldEncrypt.includes(params.action)) {
		for (const field of fields) {
			if (field in params.args.data && params.args.data[field] !== null && params.args.data[field] !== undefined) {
				params.args.data[field] = cryptr.encrypt(params.args.data[field]);
			}
		}
	}

	const result = await next(params);

	if (result && shouldDecrypt.includes(params.action)) {
		for (const field of fields) {
			if (field in result && result[field] !== null && result[field] !== undefined) {
				result[field] = cryptr.decrypt(params.result[field]);
			}
		}
	}
	return result;
};