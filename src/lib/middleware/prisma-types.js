const jsonFields = [
	'pingRoles',
	'requiredRoles',
	'staffRoles',
	'autoTag',
	'blocklist',
	'workingHours',
	'options',
	'pinnedMessages',
];

const traverse = (obj, func) => {
	for (const prop in obj) {
		console.log(prop, typeof obj[prop], obj[prop]);
		if (jsonFields.includes(prop) && obj[prop] !== null && obj[prop] !== undefined) {
			obj[prop] = func(obj[prop]);
		} else if (typeof obj[prop] === 'object') {
			obj[prop] = traverse(obj[prop], func);
		}
	}
	return obj;
};

module.exports = async (params, next) => {
	if (process.env.DB_PROVIDER === 'sqlite') {
		if (params.args.create) params.args.create = traverse(params.args.create, val => JSON.stringify(val));
		if (params.args.data) params.args.data = traverse(params.args.data, val => JSON.stringify(val));
		if (params.args.update) params.args.update = traverse(params.args.update, val => JSON.stringify(val));
		let result = await next(params);
		if (result) result = traverse(result, val => JSON.parse(val));
		return result;
	} else {
		return await next(params);
	}
};