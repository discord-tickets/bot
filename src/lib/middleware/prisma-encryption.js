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

const traverse = (obj, action) => {
	for (const prop in obj) {
		if (encryptedFields.includes(prop) && typeof obj[prop] === 'string' && obj[prop].length !== 0) {
			try {
				// prevent double encryption bug (from nested writes - notably upserting questions in category update).
				// not sure why it happens
				if (action === 'ENCRYPT' && cryptr.decrypt(obj[prop])) continue; // don't encrypt if it already encrypted
				else obj[prop] = cryptr[action.toLowerCase()](obj[prop]);
			} catch {
				// do nothing
			}
		} else if (typeof obj[prop] === 'object') {
			obj[prop] = traverse(obj[prop], action);
		}
	}
	return obj;
};

module.exports = async (params, next) => {
	if (params.args.create) params.args.create = traverse(params.args.create, 'ENCRYPT');
	if (params.args.data) params.args.data = traverse(params.args.data, 'ENCRYPT');
	if (params.args.update) params.args.update = traverse(params.args.update, 'ENCRYPT');
	let result = await next(params);
	if (result) result = traverse(result, 'DECRYPT');
	return result;
};